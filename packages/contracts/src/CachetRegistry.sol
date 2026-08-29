// SPDX-License-Identifier: MIT
pragma solidity 0.8.36;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Cachet Device Registry
/// @notice A stake-backed, self-attestation registry for device authenticity claims
/// on Monad. A registrar (refurbisher/retailer) registers a device and locks a MON
/// stake as a bond on their claim. Anyone can verify a device for free. A disputing
/// buyer can slash the registrar's bond and claim it as compensation.
/// @dev Cachet does NOT independently verify the physical condition of any device.
/// This contract only makes false authenticity claims economically expensive via a
/// slashable stake plus buyer dispute rights — it is not a physical inspection, a
/// warranty, or a guarantee of device condition.
contract CachetRegistry is ReentrancyGuard {
    /// @dev Per-device registration record, keyed by a hash of the device serial.
    struct Device {
        address registrar;
        uint256 stakeAmount;
        uint256 registeredAt;
        bool disputed;
        bytes32 metadataHash;
    }

    /// @dev Tracks the most recent verification "scan" of a serial hash. Used only
    /// for the simple duplicate-scan heuristic below — this is a UX signal, not a
    /// security control, and is intentionally not geo-spatial (out of scope).
    struct ScanRecord {
        address lastScanner;
        uint256 lastScannedAt;
    }

    /// @notice Time window within which a second, different caller scanning the
    /// same serialHash triggers a {DuplicateScanFlagged} event.
    uint256 public constant DUPLICATE_SCAN_WINDOW = 10 minutes;

    mapping(bytes32 => Device) private _devices;
    mapping(bytes32 => ScanRecord) private _scans;

    /// @notice Emitted when a registrar registers a device and locks a stake.
    event DeviceRegistered(
        bytes32 indexed serialHash,
        address indexed registrar,
        uint256 stakeAmount,
        bytes32 metadataHash,
        uint256 registeredAt
    );

    /// @notice Emitted when a device's stake is slashed following a successful dispute.
    event DeviceDisputed(
        bytes32 indexed serialHash, address indexed registrar, address indexed buyer, uint256 slashedAmount
    );

    /// @notice Emitted when the same serialHash is scanned by two different callers
    /// within {DUPLICATE_SCAN_WINDOW} of each other.
    event DuplicateScanFlagged(
        bytes32 indexed serialHash, address indexed firstScanner, address indexed secondScanner, uint256 timestamp
    );

    /// @dev Thrown when `registerDevice` is called with no MON attached.
    error ZeroStake();
    /// @dev Thrown when registering a serialHash that is already registered.
    error DeviceAlreadyRegistered(bytes32 serialHash);
    /// @dev Thrown when acting on a serialHash that has never been registered.
    error DeviceNotRegistered(bytes32 serialHash);
    /// @dev Thrown when disputing a device whose stake was already slashed.
    error DeviceAlreadyDisputed(bytes32 serialHash);
    /// @dev Thrown when the native MON transfer to a disputing buyer fails.
    error StakeTransferFailed(bytes32 serialHash, address to, uint256 amount);

    /// @notice Register a device and lock a MON stake as a bond on its authenticity
    /// claim. Called by the registrar (the refurbisher/retailer making the claim).
    /// @dev One-time registration only — reverts if `serialHash` is already
    /// registered. There is no re-registration or stake top-up in this version.
    /// Does not call out to any other address, so no reentrancy guard is needed here.
    /// @param serialHash Hash (e.g. keccak256) of the device's serial number. Never
    /// submit a raw/real IMEI or other personal identifier on-chain — hash it first.
    /// @param metadataHash Hash of off-chain metadata describing the device/condition
    /// claim (e.g. photos, grading report) that a consumer can independently fetch
    /// and check against.
    function registerDevice(bytes32 serialHash, bytes32 metadataHash) external payable {
        if (msg.value == 0) revert ZeroStake();
        if (_devices[serialHash].registrar != address(0)) {
            revert DeviceAlreadyRegistered(serialHash);
        }

        _devices[serialHash] = Device({
            registrar: msg.sender,
            stakeAmount: msg.value,
            registeredAt: block.timestamp,
            disputed: false,
            metadataHash: metadataHash
        });

        emit DeviceRegistered(serialHash, msg.sender, msg.value, metadataHash, block.timestamp);
    }

    /// @notice Free, read-only check of a device's registration and dispute status.
    /// Intended for consumers deciding whether to trust a listing — callable by
    /// anyone, costs no gas since it is a `view` function, and requires no wallet.
    /// @dev Returns all-zero/false values if `serialHash` was never registered;
    /// callers should treat `registrar == address(0)` as "not registered".
    /// @param serialHash Hash of the device serial number being checked.
    /// @return registrar Address that registered the device (address(0) if none).
    /// @return stakeAmount Currently staked MON bond, in wei (0 if slashed or unregistered).
    /// @return registeredAt Unix timestamp of registration (0 if unregistered).
    /// @return disputed Whether this device's stake has already been slashed.
    function verifyDevice(bytes32 serialHash)
        external
        view
        returns (address registrar, uint256 stakeAmount, uint256 registeredAt, bool disputed)
    {
        Device storage device = _devices[serialHash];
        return (device.registrar, device.stakeAmount, device.registeredAt, device.disputed);
    }

    /// @notice Dispute a registered device's authenticity claim. Slashes the
    /// registrar's full stake and pays it to the caller as compensation.
    /// @dev For hackathon-demo purposes, ANY address may call this as a stand-in for
    /// "the buyer" — there is no on-chain proof-of-purchase gating this call. This is
    /// a deliberate trust simplification for the demo, not a production
    /// access-control model. Slashing is flat and total (100% of the remaining
    /// stake); there are no partial-slash tiers or governance. Guarded against
    /// reentrancy because it makes an external MON transfer.
    /// @param serialHash Hash of the device serial number being disputed.
    function disputeDevice(bytes32 serialHash) external nonReentrant {
        Device storage device = _devices[serialHash];
        if (device.registrar == address(0)) revert DeviceNotRegistered(serialHash);
        if (device.disputed) revert DeviceAlreadyDisputed(serialHash);

        uint256 amount = device.stakeAmount;
        address registrar = device.registrar;

        device.disputed = true;
        device.stakeAmount = 0;

        emit DeviceDisputed(serialHash, registrar, msg.sender, amount);

        (bool success,) = payable(msg.sender).call{value: amount}("");
        if (!success) revert StakeTransferFailed(serialHash, msg.sender, amount);
    }

    /// @notice Record a verification "scan" of a device, and flag if the same
    /// serialHash was already scanned by a different caller within the last
    /// {DUPLICATE_SCAN_WINDOW} — a lightweight signal that the same claimed serial
    /// is being checked by multiple distinct parties in quick succession.
    /// Callable by anyone as part of the consumer verification flow.
    /// @dev Simple mapping/timestamp based check only; not geo-spatial and not proof
    /// of fraud on its own. Each call overwrites the stored "last scan" record for
    /// this serialHash. Moves no MON, so no reentrancy guard is needed here.
    /// @param serialHash Hash of the device serial number being scanned.
    function flagDuplicateScan(bytes32 serialHash) external {
        ScanRecord storage record = _scans[serialHash];

        if (
            record.lastScanner != address(0) && record.lastScanner != msg.sender
                && block.timestamp - record.lastScannedAt <= DUPLICATE_SCAN_WINDOW
        ) {
            emit DuplicateScanFlagged(serialHash, record.lastScanner, msg.sender, block.timestamp);
        }

        record.lastScanner = msg.sender;
        record.lastScannedAt = block.timestamp;
    }
}
