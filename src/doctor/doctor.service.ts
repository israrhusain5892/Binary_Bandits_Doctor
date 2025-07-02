import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorTimeSlots } from './entities/doctor-time-slots';
import { Repository } from 'typeorm/repository/Repository';
import { DoctorAvailability } from './entities/doctor-availability';
import { DoctorAvailabilityDto } from './Dto/doctor-availability.dto';
import { DoctorResponseDto } from './Dto/doctor-response.dto';
import { CreateDoctorDto } from './Dto/create-doctor.dto';
import { User } from 'src/auth/entities/user.entity';
// import moment from 'moment';
import { AuthService } from 'src/auth/auth.service';
import { UpdateScheduleTypeDto } from './Dto/updateSheduleType.dto';
import { Appointment } from './entities/Appointment';
import { CreateAppointmentDto } from './Dto/create-appointment.dto';
import * as moment from 'moment';
import { Status } from 'src/auth/enums/status.enum';

@Injectable()
export class DoctorService {
    availabilityRepo: any;

    constructor(

        private readonly usersService: AuthService,

        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>,

        @InjectRepository(Appointment)
        private readonly appointmentRepo: Repository<Appointment>,

        @InjectRepository(DoctorTimeSlots)
        private readonly timeSlotsRepo: Repository<DoctorTimeSlots>,

        @InjectRepository(DoctorAvailability)
        private readonly availabilityRepository: Repository<DoctorAvailability>
    ) { }




    async createDoctor(dto: CreateDoctorDto): Promise<DoctorResponseDto> {
        const user = await this.usersService.findUserByUserId(dto.user_id);


        if (!user) {
            throw new NotFoundException('User not found');
        }

        const existingDoctor = await this.doctorRepo.findOne({
            where: { user: { userId: dto.user_id } },
            relations: ['user'], // required if you need to access user fields
        });

        if (existingDoctor) {
            throw new ConflictException('Doctor already exists for this user');
        }

        const doctor = this.doctorRepo.create({
            ...dto,
            user,
        });

        const saved = await this.doctorRepo.save(doctor);

        return {
            doctor_id: saved.doctor_id,
            name: user.name,
            email: user.email,
            specialization: saved.specialization,
            experience_years: saved.experience_years,
            education: saved.education,
            clinic_name: saved.clinic_name,
            clinic_address: saved.clinic_address,
            achievements: saved.achievements,
            created_at: saved.created_at,
            updated_at: saved.updated_at

        };
    }

    // serach doctor by name


    async findByDoctorName(name: string): Promise<DoctorResponseDto[]> {
        if (!name) {
            return [];
        }

        const doctors = await this.doctorRepo.find({
            relations: ['user'],
        });

        const filtered = doctors.filter((doc) =>
            doc.user.name.toLowerCase().includes(name.toLowerCase()),
        );

        return filtered.map((doctor) => ({
            doctor_id: doctor.doctor_id,
            name: doctor.user.name,
            email: doctor.user.email,
            specialization: doctor.specialization,
            experience_years: doctor.experience_years,
            education: doctor.education,
            clinic_name: doctor.clinic_name,
            clinic_address: doctor.clinic_address,
            achievements: doctor.achievements,
            created_at: doctor.created_at,
            updated_at: doctor.updated_at

        }));
    }


    // get doctor by unique id
    async getDoctorProfile(doctor_id: string): Promise<DoctorResponseDto | any> {
        const doctor = await this.doctorRepo.findOne({
            where: { doctor_id },
            relations: ['user']  // Load the 'user' relation eagerly
        });
        if (!doctor) {
            return new UnauthorizedException("Doctor not found")
        }

        return {
            doctor_id: doctor.doctor_id,
            name: doctor.user.name,
            email: doctor.user.email,
            specialization: doctor.specialization,
            experience_years: doctor.experience_years,
            education: doctor.education,
            clinic_name: doctor.clinic_name,
            clinic_address: doctor.clinic_address,
            achievements: doctor.achievements,
            created_at: doctor.created_at,
            updated_at: doctor.updated_at
        }
    }


    // get all doctors

    async findAllDoctors(): Promise<DoctorResponseDto[]> {
        const doctors = await this.doctorRepo.find({
            relations: ['user'],
        });

        return doctors.map((doctor) => ({
            doctor_id: doctor.doctor_id,
            name: doctor.user.name,
            email: doctor.user.email,
            specialization: doctor.specialization,
            experience_years: doctor.experience_years,
            education: doctor.education,
            clinic_name: doctor.clinic_name,
            clinic_address: doctor.clinic_address,
            achievements: doctor.achievements,
            created_at: doctor.created_at,
            updated_at: doctor.updated_at

        }));

    }




    //  Doctor Availability logic here lke create all crud operatiins and pagination
    // created doctor_availability by doctor itself
    async createDoctorAvailability(doctor_id: string, availabilityDto: DoctorAvailabilityDto) {

        const doctor = await this.doctorRepo.findOne({ where: { doctor_id } });
        if (!doctor) {
            throw new NotFoundException("doctor does not exist");
        }

        const { date, start_time, end_time } = availabilityDto;

        // Check for existing availability that overlaps
        const existingAvailability = await this.availabilityRepository.findOne({
            where: {
                doctor_id,
                date,
                start_time,
                end_time
            }
        });

        if (existingAvailability) {
            throw new ConflictException("Availability already exists for the given time slot");
        }


        const availability = this.availabilityRepository.create({
            ...availabilityDto,
            doctor,           // this sets up the relationship
            doctor_id: doctor.doctor_id  // this sets the foreign key explicitly
        });

        const timeSlots = await this.createTimeSlots(
            doctor_id,
            availabilityDto.date,
            availabilityDto.start_time,
            availabilityDto.end_time,
            availabilityDto.session,
            availabilityDto.slotsDuration,
            availabilityDto.max_bookings
        )

        await this.availabilityRepository.save(availability);



        return { message: 'Availability created and time slots', availability, timeSlots };

    }


    // create time slots method 

    async createTimeSlots(
        doctorId: string,
        date: string,
        start_time: string,
        end_time: string,
        session: string,
        slotDuration: number,
        max_bookings: number
    ) {
        const start = moment(`${date} ${start_time}`, 'YYYY-MM-DD HH:mm');
        const end = moment(`${date} ${end_time}`, 'YYYY-MM-DD HH:mm');

        const timeSlots: DoctorTimeSlots[] = [];

        while (start.clone().add(slotDuration, 'minutes').isSameOrBefore(end)) {
            const slotStart = start.format('HH:mm');
            const slotEnd = start.clone().add(slotDuration, 'minutes').format('HH:mm');

            // Prevent duplicates
            const exists = await this.timeSlotsRepo.findOne({
                where: {
                    doctor_id: doctorId,
                    date,
                    start_time: slotStart
                }
            });

            if (!exists) {
                const slot = this.timeSlotsRepo.create({
                    doctor_id: doctorId,
                    date,
                    start_time: slotStart,
                    end_time: slotEnd,
                    is_available: true,
                    session,
                    max_bookings
                });
                timeSlots.push(slot);
            }

            start.add(slotDuration, 'minutes');
        }

        await this.timeSlotsRepo.save(timeSlots);
        return { message: `${timeSlots.length} slots created`, slots: timeSlots };
    }


    async getAvailableTiemSlotsByDoctorId(doctorId: string, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const slots = await this.timeSlotsRepo.find({
            where: {
                doctor_id: doctorId,
                is_available: true
            },
            order: { date: 'ASC', start_time: 'ASC' },
            skip: offset,
            take: limit
        });

        const res = { available_time_slots: slots };
        return res;
    }

    // UPDATE DOCTOR SCHEDULE_TYPE
    async updateScheduleType(doctor_id: string, dto: UpdateScheduleTypeDto) {
        const doctor = await this.doctorRepo.findOne({ where: { doctor_id } });
        if (!doctor) {
            throw new ForbiddenException('You are not authorized to update this doctor profile');
        }
        doctor.schedule_type = dto.schedule_type;
        doctor.preferred_slot_duration = dto.preferred_slot_duration;
        return this.doctorRepo.save(doctor);
    }


    // book appointment



    getMinutesDifference(start: string, end: string): number {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    }

    addMinutesToTime(time: string, minutesToAdd: number): string {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date(0, 0, 0, hours, minutes + minutesToAdd);
        return date.toTimeString().substring(0, 5); // HH:MM format
    }




    async bookAppointment(patient_id: string, dto: CreateAppointmentDto) {

        const doctor = await this.doctorRepo.findOne({ where: { doctor_id: dto.doctor_id } });

        if (!doctor) throw new NotFoundException('Doctor not found');

        const patient = await this.usersService.findUserByUserId(patient_id);

        if (!patient) throw new NotFoundException('patient not found');


        // Check if patient already has a booking for the same doctor, date, and session
        const existingAppointment = await this.appointmentRepo.findOne({
            where: {
                doctor: { doctor_id: dto.doctor_id },
                patient: { userId: patient_id },
                date: dto.date,
                session: dto.session
            },
            relations: ['doctor', 'patient']
        });

        if (existingAppointment) {
            throw new ConflictException('You have already booked a slot for this session with this doctor');
        }


        const slot = await this.timeSlotsRepo.findOne({
            where: {
                doctor: { doctor_id: dto.doctor_id },
                date: dto.date,
                start_time: dto.start_time,
                end_time: dto.end_time,
                session: dto.session,

            },
            relations: ['doctor']
        });

        if (!slot) {
            throw new NotFoundException('No such slot available');
        }



        const schedule_type = doctor.schedule_type;
        const preferredDuration = doctor.preferred_slot_duration; // e.g. 10, 15, 20
        const slotDuration = this.getMinutesDifference(slot.start_time, slot.end_time);
        const maxSubSlots = Math.floor(slotDuration / preferredDuration);
        let reporting_time: any;

        if (schedule_type === 'stream') {


            if (slot.current_bookings >= maxSubSlots) {
                throw new ConflictException('This Slot fully booked');
            }

            // Calculate the sub-slot time based on current bookings
            const subSlotStart = this.addMinutesToTime(slot.start_time, preferredDuration * slot.current_bookings);
            const subSlotEnd = this.addMinutesToTime(subSlotStart, preferredDuration);
            dto.start_time = subSlotStart;
            dto.end_time = subSlotEnd;
            reporting_time = subSlotStart;

            // Optional: Check if this sub-slot is still within main slot
            if (subSlotEnd > slot.end_time) {
                throw new ConflictException('No available sub-slots');
            }

            // Update the slot's current booking count
            slot.current_bookings += 1;
            if (slot.current_bookings >= maxSubSlots) {
                slot.is_available = false;
            }
            await this.timeSlotsRepo.save(slot);
        }

        if (schedule_type === 'wave') {

            if (slot.current_bookings >= maxSubSlots) {
                throw new ConflictException('Slot fully booked');
            }

            const interval = preferredDuration;
            const patientIndex = slot.current_bookings;

            reporting_time = this.addMinutesToTime(slot.start_time, interval * patientIndex);

            slot.current_bookings += 1;
            if (slot.current_bookings >= maxSubSlots) {
                slot.is_available = false;
            }

            await this.timeSlotsRepo.save(slot);


        }
        // Create appointment with reporting time
        const appointment = this.appointmentRepo.create({
            doctor,
            patient,
            date: dto.date,
            session: dto.session,
            start_time: dto.start_time,
            end_time: dto.end_time,
            reporting_time: reporting_time,
            status: Status.SUCCESS
        });

        return await this.appointmentRepo.save(appointment);

    }
}


