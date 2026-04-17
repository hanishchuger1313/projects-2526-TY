/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'admin' | 'shop' | 'service' | 'customer' | 'technician'} role
 * @property {string} phone
 * @property {'active' | 'pending' | 'suspended'} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Mobile
 * @property {string} id
 * @property {string} imei
 * @property {string} brand
 * @property {string} model
 * @property {string} color
 * @property {string} storage
 * @property {number} purchasePrice
 * @property {number} sellingPrice
 * @property {number} warrantyMonths
 * @property {'in-stock' | 'sold' | 'under-repair' | 'resold'} status
 * @property {string} shopId
 * @property {string} [customerId]
 * @property {string} createdAt
 * @property {string} [soldAt]
 * @property {string} [warrantyEnd]
 */

/**
 * @typedef {Object} Repair
 * @property {string} id
 * @property {string} imei
 * @property {string} mobileId
 * @property {string} customerId
 * @property {string} serviceCenterId
 * @property {string} [technicianId]
 * @property {string} issue
 * @property {Array<string>} partsReplaced
 * @property {number} cost
 * @property {'pending' | 'in-progress' | 'completed'} status
 * @property {string} createdAt
 * @property {string} [completedAt]
 * @property {'low' | 'medium' | 'high'} priority
 */

/**
 * @typedef {Object} Sale
 * @property {string} id
 * @property {string} invoiceNo
 * @property {string} mobileId
 * @property {string} shopId
 * @property {string} customerId
 * @property {string} customerName
 * @property {number} amount
 * @property {string} saleDate
 * @property {string} warrantyEnd
 */

/**
 * @typedef {Object} Warranty
 * @property {string} id
 * @property {string} mobileId
 * @property {string} customerId
 * @property {string} startDate
 * @property {string} endDate
 * @property {'active' | 'expiring-soon' | 'expired'} status
 */

/**
 * @typedef {Object} Shop
 * @property {string} id
 * @property {string} name
 * @property {string} ownerId
 * @property {string} location
 * @property {string} phone
 * @property {'active' | 'pending' | 'suspended'} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ServiceCenter
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {string} phone
 * @property {'active' | 'pending' | 'suspended'} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Technician
 * @property {string} id
 * @property {string} name
 * @property {string} serviceCenterId
 * @property {number} activeJobs
 * @property {number} completedJobs
 * @property {'available' | 'busy'} availability
 */

export {};
