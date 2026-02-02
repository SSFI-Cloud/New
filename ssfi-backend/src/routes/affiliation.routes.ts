import { Router } from 'express';
import affiliationController from '../controllers/affiliation.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadFields } from '../middleware/upload.middleware';

const router = Router();

// File upload configuration
const secretaryUpload = uploadFields([
  { name: 'identityProof', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
]);

const clubUpload = uploadFields([
  { name: 'clubLogo', maxCount: 1 },
]);

// ==========================================
// PUBLIC ROUTES (Registration Status)
// ==========================================

/**
 * @route   GET /api/v1/affiliations/status
 * @desc    Get all registration statuses
 * @access  Public
 */
router.get('/status', affiliationController.getAllRegistrationStatuses);

/**
 * @route   GET /api/v1/affiliations/status/:type
 * @desc    Check registration status for a specific type
 * @access  Public
 */
router.get('/status/:type', affiliationController.checkRegistrationStatus);

// ==========================================
// PUBLIC REGISTRATION ROUTES
// ==========================================

/**
 * @route   POST /api/v1/affiliations/state-secretary
 * @desc    Register as State Secretary
 * @access  Public (when registration is open)
 */
router.post('/state-secretary', secretaryUpload, affiliationController.registerStateSecretary);

/**
 * @route   POST /api/v1/affiliations/district-secretary
 * @desc    Register as District Secretary
 * @access  Public (when registration is open)
 */
router.post('/district-secretary', secretaryUpload, affiliationController.registerDistrictSecretary);

/**
 * @route   POST /api/v1/affiliations/club
 * @desc    Register a Club
 * @access  Public (when registration is open)
 */
router.post('/club', clubUpload, affiliationController.registerClub);

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================

router.use(authenticate);

// ==========================================
// REGISTRATION WINDOW MANAGEMENT (Admin Only)
// ==========================================

/**
 * @route   GET /api/v1/affiliations/windows
 * @desc    Get all registration windows
 * @access  Private (Global Admin)
 */
router.get(
  '/windows',
  requireRole('GLOBAL_ADMIN'),
  affiliationController.getRegistrationWindows
);

/**
 * @route   POST /api/v1/affiliations/windows
 * @desc    Create a registration window
 * @access  Private (Global Admin)
 */
router.post(
  '/windows',
  requireRole('GLOBAL_ADMIN'),
  affiliationController.createRegistrationWindow
);

/**
 * @route   PUT /api/v1/affiliations/windows/:id
 * @desc    Update a registration window
 * @access  Private (Global Admin)
 */
router.put(
  '/windows/:id',
  requireRole('GLOBAL_ADMIN'),
  affiliationController.updateRegistrationWindow
);

/**
 * @route   DELETE /api/v1/affiliations/windows/:id
 * @desc    Delete/deactivate a registration window
 * @access  Private (Global Admin)
 */
router.delete(
  '/windows/:id',
  requireRole('GLOBAL_ADMIN'),
  affiliationController.deleteRegistrationWindow
);

// ==========================================
// STATE SECRETARY MANAGEMENT
// ==========================================

/**
 * @route   GET /api/v1/affiliations/state-secretaries
 * @desc    Get all state secretaries
 * @access  Private (Global Admin)
 */
router.get(
  '/state-secretaries',
  requireRole('GLOBAL_ADMIN'),
  affiliationController.listStateSecretaries
);

/**
 * @route   PUT /api/v1/affiliations/state-secretary/:id/status
 * @desc    Approve/Reject state secretary
 * @access  Private (Global Admin)
 */
router.put(
  '/state-secretary/:id/status',
  requireRole('GLOBAL_ADMIN'),
  affiliationController.updateStateSecretaryStatus
);

// ==========================================
// DISTRICT SECRETARY MANAGEMENT
// ==========================================

/**
 * @route   GET /api/v1/affiliations/district-secretaries
 * @desc    Get all district secretaries
 * @access  Private (Global Admin, State Secretary)
 */
router.get(
  '/district-secretaries',
  requireRole('GLOBAL_ADMIN', 'STATE_SECRETARY'),
  affiliationController.listDistrictSecretaries
);

/**
 * @route   PUT /api/v1/affiliations/district-secretary/:id/status
 * @desc    Approve/Reject district secretary
 * @access  Private (Global Admin, State Secretary)
 */
router.put(
  '/district-secretary/:id/status',
  requireRole('GLOBAL_ADMIN', 'STATE_SECRETARY'),
  affiliationController.updateDistrictSecretaryStatus
);

// ==========================================
// CLUB MANAGEMENT
// ==========================================

/**
 * @route   GET /api/v1/affiliations/clubs
 * @desc    Get all clubs
 * @access  Private (Global Admin, State Secretary, District Secretary)
 */
router.get(
  '/clubs',
  requireRole('GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY'),
  affiliationController.listClubs
);

/**
 * @route   PUT /api/v1/affiliations/club/:id/status
 * @desc    Approve/Reject club
 * @access  Private (Global Admin, State Secretary, District Secretary)
 */
router.put(
  '/club/:id/status',
  requireRole('GLOBAL_ADMIN', 'STATE_SECRETARY', 'DISTRICT_SECRETARY'),
  affiliationController.updateClubStatus
);

export default router;
