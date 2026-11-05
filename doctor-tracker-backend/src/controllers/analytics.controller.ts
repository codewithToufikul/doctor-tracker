import { Request, Response, NextFunction } from 'express';
import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';

export const getOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalDoctors,
      totalPatients,
      unassignedPatients,
      activePatientsCount,
      criticalPatientsCount,
      underTreatmentCount,
      dischargedCount,
    ] = await Promise.all([
      Doctor.countDocuments({ active: true }),
      Patient.countDocuments(),
      Patient.countDocuments({ doctorId: null }),
      Patient.countDocuments({ status: 'Active' }),
      Patient.countDocuments({ status: 'Critical' }),
      Patient.countDocuments({ status: 'Under Treatment' }),
      Patient.countDocuments({ status: 'Discharged' }),
    ]);

    const averagePatientsPerDoctor =
      totalDoctors > 0 ? Number((totalPatients / totalDoctors).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        unassignedPatients,
        averagePatientsPerDoctor,
        activePatientsCount,
        criticalPatientsCount,
        underTreatmentCount,
        dischargedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientsPerDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 10));

    const distribution = await Patient.aggregate([
      { $match: { doctorId: { $ne: null } } },
      { $group: { _id: '$doctorId', patientCount: { $sum: 1 } } },
      { $sort: { patientCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          _id: 0,
          doctorId: '$_id',
          doctorName: '$doctor.name',
          specialization: '$doctor.specialization',
          hospital: '$doctor.hospital',
          patientCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmissionTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(String(req.query.days), 10) || 30));

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    cutoffDate.setHours(0, 0, 0, 0);

    const rawTrends = await Patient.aggregate([
      { $match: { admissionDate: { $gte: cutoffDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$admissionDate' } },
          admissions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const trendsMap = new Map<string, number>();
    for (const item of rawTrends) {
      trendsMap.set(item._id, item.admissions);
    }

    const continuousTrends: Array<{ date: string; admissions: number }> = [];
    const currentDate = new Date(cutoffDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      continuousTrends.push({
        date: dateStr,
        admissions: trendsMap.get(dateStr) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: continuousTrends,
    });
  } catch (error) {
    next(error);
  }
};

export const getConditionDistribution = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [distribution, totalPatients] = await Promise.all([
      Patient.aggregate([
        { $group: { _id: '$condition', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Patient.countDocuments(),
    ]);

    const formattedDistribution = distribution.map((item) => ({
      condition: item._id as string,
      count: item.count as number,
      percentage:
        totalPatients > 0 ? Number(((item.count / totalPatients) * 100).toFixed(1)) : 0,
    }));

    res.status(200).json({
      success: true,
      data: formattedDistribution,
    });
  } catch (error) {
    next(error);
  }
};
