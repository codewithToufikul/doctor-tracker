import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Patient } from '../models/patient.model.js';
import { Doctor } from '../models/doctor.model.js';
import { NotFoundError, BadRequestError } from '../utils/AppError.js';
import {
  parsePagination,
  formatPaginationMeta,
  buildDateRangeFilter,
  escapeRegex,
} from '../utils/queryBuilder.js';
import { CreatePatientInput, UpdatePatientInput } from '../validations/patient.validation.js';

export const getPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, condition, status, doctorId, startDate, endDate, sortBy, sortOrder } = req.query;

    const filter: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      const sanitized = escapeRegex(search.trim());
      const searchRegex = new RegExp(sanitized, 'i');
      filter.$or = [{ name: searchRegex }, { phone: searchRegex }, { email: searchRegex }];
    }

    if (condition && typeof condition === 'string') {
      filter.condition = new RegExp(`^${escapeRegex(condition.trim())}$`, 'i');
    }

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    if (doctorId && typeof doctorId === 'string') {
      if (doctorId.toLowerCase() === 'unassigned') {
        filter.doctorId = null;
      } else if (Types.ObjectId.isValid(doctorId)) {
        filter.doctorId = new Types.ObjectId(doctorId);
      }
    }

    const dateFilter = buildDateRangeFilter(
      typeof startDate === 'string' ? startDate : undefined,
      typeof endDate === 'string' ? endDate : undefined,
      'admissionDate'
    );
    Object.assign(filter, dateFilter);

    const sortField = typeof sortBy === 'string' ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [patients, totalRecords] = await Promise.all([
      Patient.find(filter)
        .populate('doctorId', 'name specialization hospital email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(filter),
    ]);

    const formattedPatients = patients.map((patient) => {
      const { doctorId: doctor, ...rest } = patient;
      return {
        ...rest,
        doctor: doctor && typeof doctor === 'object' ? doctor : null,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedPatients,
      pagination: formatPaginationMeta(totalRecords, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid patient identifier format');
    }

    const patient = await Patient.findById(id)
      .populate('doctorId', 'name specialization hospital email')
      .lean();

    if (!patient) {
      throw new NotFoundError('Patient record not found');
    }

    const { doctorId: doctor, ...rest } = patient;

    res.status(200).json({
      success: true,
      data: {
        ...rest,
        doctor: doctor && typeof doctor === 'object' ? doctor : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (
  req: Request<unknown, unknown, CreatePatientInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { doctorId, admissionDate, email, ...restData } = req.body;

    let assignedDoctorId: Types.ObjectId | null = null;
    if (doctorId) {
      if (!Types.ObjectId.isValid(doctorId)) {
        throw new BadRequestError('Invalid doctor ID format');
      }
      const doctorExists = await Doctor.findById(doctorId);
      if (!doctorExists) {
        throw new NotFoundError('Assigned doctor does not exist');
      }
      assignedDoctorId = new Types.ObjectId(doctorId);
    }

    const patient = await Patient.create({
      ...restData,
      email: email && email.trim() !== '' ? email.trim() : undefined,
      doctorId: assignedDoctorId,
      admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
    });

    const populatedPatient = await Patient.findById(patient._id)
      .populate('doctorId', 'name specialization hospital email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Patient created successfully.',
      data: populatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (
  req: Request<{ id: string }, unknown, UpdatePatientInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid patient identifier format');
    }

    const { doctorId, email, admissionDate, ...updateData } = req.body;
    const finalUpdate: Record<string, unknown> = { ...updateData };

    if (email !== undefined) {
      finalUpdate.email = email.trim() !== '' ? email.trim() : undefined;
    }

    if (admissionDate !== undefined) {
      finalUpdate.admissionDate = new Date(admissionDate);
    }

    if (doctorId !== undefined) {
      if (doctorId === null || doctorId === '') {
        finalUpdate.doctorId = null;
      } else {
        if (!Types.ObjectId.isValid(doctorId)) {
          throw new BadRequestError('Invalid doctor ID format');
        }
        const doctorExists = await Doctor.findById(doctorId);
        if (!doctorExists) {
          throw new NotFoundError('Assigned doctor does not exist');
        }
        finalUpdate.doctorId = new Types.ObjectId(doctorId);
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: finalUpdate },
      { new: true, runValidators: true }
    )
      .populate('doctorId', 'name specialization hospital email')
      .lean();

    if (!updatedPatient) {
      throw new NotFoundError('Patient record not found');
    }

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully.',
      data: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid patient identifier format');
    }

    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      throw new NotFoundError('Patient record not found');
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
