import { Request, Response, NextFunction } from 'express';
import * as service from '../services/state-secretary.service';

export const getStateSecretaries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await service.listStateSecretaries(req.query);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        const userId = req.user?.id.toString() || 'admin';

        const result = await service.updateStateSecretaryStatus(id, status, userId, remarks);
        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        next(error);
    }
};
