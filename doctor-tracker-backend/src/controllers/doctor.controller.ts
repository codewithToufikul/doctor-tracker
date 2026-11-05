import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/AppError.js';
import {
  parsePagination,
  formatPaginationMeta,
  buildDateRangeFilter,
  escapeRegex,
} from '../utils/queryBuilder.js';
import { CreateDoctorInput, UpdateDoctorInput } from '../validations/doctor.validation.js';

export const getDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, specialization, hospital, startDate, endDate, sortBy, sortOrder } = req.query;

    const filter: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      filter.$or = [
        { name: searchRegex },
        { specialization: searchRegex },
        { hospital: searchRegex },
        { email: searchRegex },
      ];
    }

    if (specialization && typeof specialization === 'string') {
      filter.specialization = new RegExp(`^${escapeRegex(specialization.trim())}$`, 'i');
    }

    if (hospital && typeof hospital === 'string') {
      filter.hospital = new RegExp(`^${escapeRegex(hospital.trim())}$`, 'i');
    }

    const dateFilter = buildDateRangeFilter(
      typeof startDate === 'string' ? startDate : undefined,
      typeof endDate === 'string' ? endDate : undefined,
      'createdAt'
    );
    Object.assign(filter, dateFilter);

    const sortField = typeof sortBy === 'string' ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [doctors, totalRecords] = await Promise.all([
      Doctor.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      Doctor.countDocuments(filter),
    ]);

    const doctorIds = doctors.map((doc) => doc._id);
    const patientCounts = await Patient.aggregate([
      { $match: { doctorId: { $in: doctorIds } } },
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
    ]);

    const countsMap = new Map<string, number>();
    for (const item of patientCounts) {
      countsMap.set(item._id.toString(), item.count);
    }

    const enrichedDoctors = doctors.map((doc) => ({
      ...doc,
      patientCount: countsMap.get(doc._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      data: enrichedDoctors,
      pagination: formatPaginationMeta(totalRecords, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid doctor identifier format');
    }

    const doctor = await Doctor.findById(id).lean();
    if (!doctor) {
      throw new NotFoundError('Doctor record not found');
    }

    const patientCount = await Patient.countDocuments({ doctorId: doctor._id });

    res.status(200).json({
      success: true,
      data: {
        ...doctor,
        patientCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (
  req: Request<unknown, unknown, CreateDoctorInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      throw new ConflictError('A doctor with this email address already exists.');
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (
  req: Request<{ id: string }, unknown, UpdateDoctorInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid doctor identifier format');
    }

    const { email } = req.body;
    if (email) {
      const existing = await Doctor.findOne({ email, _id: { $ne: id } });
      if (existing) {
        throw new ConflictError('A doctor with this email address already exists.');
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedDoctor) {
      throw new NotFoundError('Doctor record not found');
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully.',
      data: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid doctor identifier format');
    }

    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      throw new NotFoundError('Doctor record not found');
    }

    const updateResult = await Patient.updateMany(
      { doctorId: doctor._id },
      { $set: { doctorId: null } }
    );

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully.',
      unassignedPatientsCount: updateResult.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
