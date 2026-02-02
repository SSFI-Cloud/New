import { Request, Response, NextFunction } from 'express';
import * as clubService from '../services/club.service';
import { AppError } from '../utils/errors';

export const getClubs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await clubService.getAllClubs(req.query);
        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateClubStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        const result = await clubService.updateClubStatus(Number(id), status, remarks);
        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
