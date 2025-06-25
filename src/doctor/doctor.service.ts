import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorTimeSlots } from './entities/doctor-time-slots';
import { Repository } from 'typeorm/repository/Repository';
import { DoctorAvailability } from './entities/doctor-availability';
import { DoctorAvailabilityDto } from './Dto/doctor-availability.dto';
import { DoctorResponseDto } from './Dto/doctor-response.dto';
import { CreateDoctorDto } from './Dto/create-doctor.dto';
import { User } from 'src/auth/entities/user.entity';
import moment from 'moment';
import { AuthService } from 'src/auth/auth.service';
// import * as moment from 'moment';

@Injectable()
export class DoctorService {

    constructor(
       
        private readonly usersService: AuthService,

        @InjectRepository(Doctor)
        private readonly doctorRepo: Repository<Doctor>,

        @InjectRepository(DoctorTimeSlots)
        private readonly timeSlotsRepo: Repository<DoctorTimeSlots>,

        @InjectRepository(DoctorAvailability)
        private readonly availabilityRepository: Repository<DoctorAvailability>,
    ) { }




    async createDoctor(dto: CreateDoctorDto): Promise<DoctorResponseDto> {
        const user = await this.usersService.findUserByUserId(dto.user_id)

        if (!user) {
            throw new NotFoundException('User not found');
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


        const availability = this.availabilityRepository.create({
            ...availabilityDto,
            doctor,           // this sets up the relationship
            doctor_id: doctor.doctor_id  // this sets the foreign key explicitly
        });

        const timeSlots = await this.createTimeSlots(
            doctor_id,
            availabilityDto.date,
            availabilityDto.start_time,
            availabilityDto.end_time
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
        slotDuration = 30
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
                    is_available: true
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

        return { available_time_slots: slots };
    }
}


