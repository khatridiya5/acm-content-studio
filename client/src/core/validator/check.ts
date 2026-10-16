import { DesignPlan } from '@/types';
import { checkBounds } from './bounds';
import { checkContrast } from './contrast';

export const checkPlan = (p: DesignPlan) => [...checkBounds(p), ...checkContrast(p)];