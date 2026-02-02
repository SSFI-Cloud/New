import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await eventService.getAllEvents(req.query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await eventService.getEventById(Number(req.params.id));
    if (!result) {
      return res.status(404).json({ status: 'fail', message: 'Event not found' });
    }
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export const updateEventStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // status: PUBLISHED, REJECTED, etc.
    const result = await eventService.updateEventStatus(Number(id), status, remarks);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export const getMyEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    const result = await eventService.getUserEvents(userId, req.query);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
