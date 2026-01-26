/**
 * Arsipari Routes Index
 * Exports all arsipari routes
 */

import { Router } from 'express';
import incomingLetterRoutes from './incoming-letter.routes';
import outgoingLetterRoutes from './outgoing-letter.routes';
import dispositionRoutes from './disposition.routes';
import templateRoutes from './template.routes';
import archiveRoutes from './archive.routes';
import letterSubjectRoutes from './letter-subject.routes';

const router = Router();

// Mount all routes
router.use('/surat-masuk', incomingLetterRoutes);
router.use('/surat-keluar', outgoingLetterRoutes);
router.use('/disposisi', dispositionRoutes);
router.use('/template', templateRoutes);
router.use('/arsip', archiveRoutes);
router.use('/perihal', letterSubjectRoutes);

export default router;
