import { type Repository } from '@libs/ddd';
import { type Correction } from './correction.aggregate';

export interface CorrectionRepository extends Repository<Correction> {}
