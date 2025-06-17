import Inventory from '../DB/models/inventory.model.js';
import Asset from '../DB/models/asset.model.js';

/**
 * Ensures the inventory document exists. If not, it creates one.
 */
export const ensureInventory = async (baseId, assetId) => {
    let inventory = await Inventory.findOne({ base: baseId, asset: assetId });

    if (!inventory) {
        inventory = await Inventory.create({
            asset: assetId,
            base: baseId,
            quantity: 0,
            purchased: 0,
            expended: 0,
            assigned: 0,
            transferredOut: 0,
            transferredIn: 0
        });
    }

    return inventory;
};

/**
 * Handle asset purchase (adds to quantity and purchased count)
 */
export const purchaseAsset = async (baseId, assetId, qty) => {
    const inventory = await ensureInventory(baseId, assetId);

    inventory.purchased += qty;
    inventory.quantity += qty;

    return await inventory.save();
};

/**
 * Handle asset expenditure (removes from quantity and adds to expended)
 */
export const expendAsset = async (baseId, assetId, qty) => {
    const inventory = await ensureInventory(baseId, assetId);

    if (inventory.quantity < qty) {
        throw new Error('Not enough stock to expend.');
    }

    inventory.expended += qty;
    inventory.quantity -= qty;

    return await inventory.save();
};

/**
 * Assign asset to personnel (reduces quantity, increases assigned)
 */
export const assignAsset = async (baseId, assetId, qty) => {
    const inventory = await ensureInventory(baseId, assetId);

    if (inventory.quantity < qty) {
        throw new Error('Not enough stock to assign.');
    }

    inventory.assigned += qty;
    inventory.quantity -= qty;

    return await inventory.save();
};

/**
 * Transfer asset to another base.
 * Updates transferredOut on source base and transferredIn on destination base.
 */
export const transferAsset = async (fromBaseId, toBaseId, assetId, qty) => {
    if (fromBaseId.toString() === toBaseId.toString()) {
        throw new Error('Source and destination base cannot be the same.');
    }

    // Deduct from source base
    const fromInventory = await ensureInventory(fromBaseId, assetId);
    if (fromInventory.quantity < qty) {
        throw new Error('Not enough stock to transfer.');
    }

    fromInventory.transferredOut += qty;
    fromInventory.quantity -= qty;
    await fromInventory.save();

    // Add to destination base
    const toInventory = await ensureInventory(toBaseId, assetId);
    toInventory.transferredIn += qty;
    toInventory.quantity += qty;
    await toInventory.save();

    return {
        from: fromInventory,
        to: toInventory
    };
};


/**
 * GET /api/inventory/my
 * Get inventory for the current user's base (with optional asset filter)
 * Returns: base details once + array of stocks
 */
export const getMyStockDetails = async (req, res) => {
    try {
        const baseId = req.user.baseId;
        const { asset } = req.query;

        if (!baseId) return res.status(400).json({ message: 'User base ID not found' });

        const query = { base: baseId };
        if (asset) query.asset = asset;

        const stocks = await Inventory.find(query)
            .populate('asset', 'name category unit')
            .populate('base', 'name state district');

        if (!stocks.length) {
            return res.status(200).json({ base: null, stocks: [] });
        }

        // Extract base info from the first item (since all have the same base)
        const base = {
            name: stocks[0].base.name,
            state: stocks[0].base.state,
            district: stocks[0].base.district,
        };

        const formattedStocks = stocks.map(({ asset, quantity, purchased, expended, assigned, transferredOut, transferredIn, _id }) => ({
            _id,
            asset,
            quantity,
            purchased,
            expended,
            assigned,
            transferredOut,
            transferredIn
        }));

        res.status(200).json({ base, stocks: formattedStocks });
    } catch (error) {
        console.error('Error fetching my stock details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/inventory
 * Get all inventory with optional base and assetType filters
 */
export const getAllStockDetails = async (req, res) => {
    try {
        const { base, assetType } = req.query;

        // Build query dynamically
        const query = {};
        if (base) query.base = base;
        if (assetType) {
            const assetIds = await Asset.find({ category: assetType }).select('_id');
            query.asset = { $in: assetIds };
        }

        const stock = await Inventory.find(query)
            .populate('asset', 'name category unit')
            .populate('base', 'name state district');

        res.status(200).json(stock);
    } catch (error) {
        console.error('Error fetching all stock details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
