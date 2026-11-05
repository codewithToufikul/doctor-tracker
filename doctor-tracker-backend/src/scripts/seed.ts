import { env } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { Admin } from '../models/admin.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Patient } from '../models/patient.model.js';

const seedDatabase = async (): Promise<void> => {
  console.log('Starting database seeding...');
  await connectDatabase();

  await Admin.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});

  const admin = new Admin({
    name: 'Clinical Operations Admin',
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    role: 'admin',
  });
  await admin.save();
  console.log(`Admin account created for: ${env.ADMIN_EMAIL}`);

  const sampleDoctors = [
    {
      name: 'Dr. Sarah Jenkins',
      specialization: 'Cardiology',
      hospital: 'Metro General Hospital',
      phone: '+1 (555) 234-5671',
      email: 'sarah.jenkins@metrohealth.org',
    },
    {
      name: 'Dr. Marcus Vance',
      specialization: 'Neurology',
      hospital: 'St. Jude Medical Center',
      phone: '+1 (555) 345-6782',
      email: 'm.vance@stjude.org',
    },
    {
      name: 'Dr. Elena Rostova',
      specialization: 'Pediatrics',
      hospital: "Children's National Hospital",
      phone: '+1 (555) 456-7893',
      email: 'elena.rostova@childrenshealth.org',
    },
    {
      name: 'Dr. David Kim',
      specialization: 'Orthopedics',
      hospital: 'Mount Sinai Hospital',
      phone: '+1 (555) 567-8904',
      email: 'david.kim@mountsinai.org',
    },
    {
      name: 'Dr. Amara Patel',
      specialization: 'Oncology',
      hospital: 'Memorial Sloan Kettering',
      phone: '+1 (555) 678-9015',
      email: 'amara.patel@mskcc.org',
    },
    {
      name: 'Dr. Robert Chen',
      specialization: 'Dermatology',
      hospital: 'Pacific Health Center',
      phone: '+1 (555) 789-0126',
      email: 'robert.chen@pacifichealth.org',
    },
    {
      name: 'Dr. Lisa Morales',
      specialization: 'General Surgery',
      hospital: 'Mayo Clinic',
      phone: '+1 (555) 890-1237',
      email: 'morales.lisa@mayoclinic.org',
    },
    {
      name: 'Dr. James Wilson',
      specialization: 'Pulmonology',
      hospital: 'Johns Hopkins Hospital',
      phone: '+1 (555) 901-2348',
      email: 'jwilson@jhmi.edu',
    },
  ];

  const createdDoctors = await Doctor.insertMany(sampleDoctors);
  console.log(`Seeded ${createdDoctors.length} doctors.`);

  const now = new Date();
  const getPastDate = (daysAgo: number): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  const samplePatients = [
    {
      name: 'Arthur Pendelton',
      age: 64,
      gender: 'male' as const,
      phone: '+1 (555) 111-2233',
      email: 'arthur.p@example.com',
      condition: 'Cardiovascular',
      status: 'Active' as const,
      doctorId: createdDoctors[0]._id,
      admissionDate: getPastDate(25),
      medicalNotes: 'Stage 2 hypertension with periodic angina symptoms.',
    },
    {
      name: 'Beatrice Miller',
      age: 52,
      gender: 'female' as const,
      phone: '+1 (555) 222-3344',
      email: 'beatrice.m@example.com',
      condition: 'Hypertension',
      status: 'Under Treatment' as const,
      doctorId: createdDoctors[0]._id,
      admissionDate: getPastDate(18),
      medicalNotes: 'Responding well to ACE inhibitor therapy.',
    },
    {
      name: 'Carlos Mendoza',
      age: 71,
      gender: 'male' as const,
      phone: '+1 (555) 333-4455',
      condition: 'Cardiovascular',
      status: 'Critical' as const,
      doctorId: createdDoctors[0]._id,
      admissionDate: getPastDate(3),
      medicalNotes: 'Monitored in cardiac intensive care post-angioplasty.',
    },
    {
      name: 'Diana Prince',
      age: 43,
      gender: 'female' as const,
      phone: '+1 (555) 444-5566',
      email: 'diana.p@example.com',
      condition: 'Neurological Migraine',
      status: 'Active' as const,
      doctorId: createdDoctors[1]._id,
      admissionDate: getPastDate(14),
      medicalNotes: 'Chronic vestibular migraine evaluation.',
    },
    {
      name: 'Ethan Hunt',
      age: 38,
      gender: 'male' as const,
      phone: '+1 (555) 555-6677',
      condition: 'Post-Concussion',
      status: 'Under Treatment' as const,
      doctorId: createdDoctors[1]._id,
      admissionDate: getPastDate(8),
      medicalNotes: 'Physical rehabilitation following sports injury.',
    },
    {
      name: 'Fiona Gallagher',
      age: 7,
      gender: 'female' as const,
      phone: '+1 (555) 666-7788',
      email: 'gallagher.family@example.com',
      condition: 'Pediatric Asthma',
      status: 'Active' as const,
      doctorId: createdDoctors[2]._id,
      admissionDate: getPastDate(20),
      medicalNotes: 'Allergy-induced bronchospasm maintenance program.',
    },
    {
      name: 'George Clark',
      age: 10,
      gender: 'male' as const,
      phone: '+1 (555) 777-8899',
      condition: 'General Checkup',
      status: 'Discharged' as const,
      doctorId: createdDoctors[2]._id,
      admissionDate: getPastDate(29),
      medicalNotes: 'Annual developmental screening complete.',
    },
    {
      name: 'Hannah Abbott',
      age: 34,
      gender: 'female' as const,
      phone: '+1 (555) 888-9900',
      condition: 'ACL Reconstruction',
      status: 'Under Treatment' as const,
      doctorId: createdDoctors[3]._id,
      admissionDate: getPastDate(12),
      medicalNotes: 'Post-operative week 3 mobility therapy.',
    },
    {
      name: 'Ian Malcolm',
      age: 59,
      gender: 'male' as const,
      phone: '+1 (555) 999-0011',
      email: 'ian.m@example.com',
      condition: 'Osteoarthritis',
      status: 'Active' as const,
      doctorId: createdDoctors[3]._id,
      admissionDate: getPastDate(22),
      medicalNotes: 'Bilateral knee inflammation therapy.',
    },
    {
      name: 'Julia Roberts',
      age: 48,
      gender: 'female' as const,
      phone: '+1 (555) 123-4567',
      condition: 'Breast Neoplasm',
      status: 'Under Treatment' as const,
      doctorId: createdDoctors[4]._id,
      admissionDate: getPastDate(15),
      medicalNotes: 'Chemotherapy cycle 2 scheduled.',
    },
    {
      name: 'Kevin Bacon',
      age: 62,
      gender: 'male' as const,
      phone: '+1 (555) 234-5678',
      condition: 'Melanoma',
      status: 'Active' as const,
      doctorId: createdDoctors[5]._id,
      admissionDate: getPastDate(10),
      medicalNotes: 'Excision biopsy margins clear; routine surveillance.',
    },
    {
      name: 'Laura Croft',
      age: 29,
      gender: 'female' as const,
      phone: '+1 (555) 345-6789',
      email: 'laura.c@example.com',
      condition: 'Acute Appendicitis',
      status: 'Discharged' as const,
      doctorId: createdDoctors[6]._id,
      admissionDate: getPastDate(28),
      medicalNotes: 'Laparoscopic appendectomy recovery uncomplicated.',
    },
    {
      name: 'Michael Scott',
      age: 46,
      gender: 'male' as const,
      phone: '+1 (555) 456-7890',
      condition: 'COPD',
      status: 'Under Treatment' as const,
      doctorId: createdDoctors[7]._id,
      admissionDate: getPastDate(7),
      medicalNotes: 'Spirometry improvements noted with bronchodilators.',
    },
    {
      name: 'Nancy Wheeler',
      age: 22,
      gender: 'female' as const,
      phone: '+1 (555) 567-8901',
      condition: 'Hypertension',
      status: 'Active' as const,
      doctorId: null,
      admissionDate: getPastDate(5),
      medicalNotes: 'Newly diagnosed primary hypertension awaiting doctor assignment.',
    },
    {
      name: 'Oliver Queen',
      age: 35,
      gender: 'male' as const,
      phone: '+1 (555) 678-9012',
      condition: 'Orthopedic Fracture',
      status: 'Active' as const,
      doctorId: null,
      admissionDate: getPastDate(2),
      medicalNotes: 'Transferred from urgent care; awaiting orthopedic intake.',
    },
  ];

  const createdPatients = await Patient.insertMany(samplePatients);
  console.log(`Seeded ${createdPatients.length} patients (including unassigned records).`);

  console.log('Database seeding completed successfully.');
  await disconnectDatabase();
};

seedDatabase().catch((error) => {
  console.error('Seeding failure:', error);
  process.exit(1);
});
