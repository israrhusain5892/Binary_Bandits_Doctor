import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { registerUserDto } from './Dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { loginUserDto } from './Dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import refreshJwtConfig from 'src/config/refresh-jwt.config';
import *as bcrypt from "bcrypt";
import { CreateDoctorDto } from './Dto/create-doctor.dto';
import { DoctorResponseDto } from './Dto/doctor-response.dto';
import { Doctor } from './entities/doctor.entity';
import { DoctorAvailabilityDto } from './Dto/doctor-availability.dto';
import { DoctorAvailability } from './entities/doctor-availability';
import * as moment from 'moment';
import { DoctorTimeSlots } from './entities/doctor-time-slots';
@Injectable()
export class AuthService {




  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(DoctorTimeSlots)
    private readonly timeSlotsRepo: Repository<DoctorTimeSlots>,

    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepository: Repository<DoctorAvailability>,

    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtTokenConfig: ConfigType<typeof jwtConfig>,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshJwtTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) { }


  // by defualt it register user with user role
  async create(registerUserDto: registerUserDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: registerUserDto.email } });
    if (existingUser) {
      throw new ConflictException(`User already registered with Email ${existingUser.email}`);
    }
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const user = this.userRepository.create({ ...registerUserDto, password: hashedPassword });
    const savedUser = this.userRepository.save(user);
    return savedUser;

  }

  async login(loginUserDto: loginUserDto) {
    const findUser = await this.userRepository.findOne({ where: { email: loginUserDto.email } });
    if (!findUser) {
      throw new NotFoundException("User not registered!!");
    }
    const hashedPassword = findUser.password;
    if (!bcrypt.compare(hashedPassword, loginUserDto.password)) {
      throw new UnauthorizedException("User authentication unauthorized");
    }
    const { accessToken, refreshToken } = await this.generateJwtTokens(findUser);
    // not send password to client
    const hashedRefresahToken = bcrypt.hash(refreshToken, 10)
    await this.updateRefeshTokenInDB(findUser.userId, hashedRefresahToken);
    const { password, ...user } = findUser;

    return {
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
      message: "login successfully"
    }
  }


  async generateJwtTokens(user: any) {
    const payload = { sub: user.userId, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtTokenConfig.secret,
      expiresIn: this.jwtTokenConfig.signOptions?.expiresIn,
    });
    // refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.refreshJwtTokenConfig.secret,
      expiresIn: this.refreshJwtTokenConfig.signOptions?.expiresIn
    })

    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }


  async updateRefeshTokenInDB(userId: string, refresh_Token: any) {
    return await this.userRepository.update({ userId: userId }, { refresh_Token });
  }


  async validateJwtUser(userId: string) {
    const user = this.userRepository.findOne({ where: { userId: userId } });
    if (!user) {
      throw new NotFoundException("user not found by Id to validate");
    }
    return user;
  }


  async refreshToken(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { userId: id } });
      const { refreshToken, accessToken } = await this.generateJwtTokens(user);
      await this.updateRefeshTokenInDB(id, bcrypt.hash(refreshToken, 10));
      return {
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,

      }

    }
    catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

  }

  async validateRefreshToken(userId: string, refresh_Token: any) {

    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user || !user.refresh_Token) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const isMatchRefreshToken = bcrypt.compare(refresh_Token, user.refresh_Token);
    if (!isMatchRefreshToken) {
      throw new UnauthorizedException("Invalid refresh Token");
    }
    return user;
  }



  async signOut(userId: string) {
    await this.updateRefeshTokenInDB(userId, null);
  }



  async validateGoogleUser(profileData: registerUserDto) {
    const email = profileData.email;
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      const newUser = this.userRepository.create(profileData);
      await this.userRepository.save(newUser);
      throw new NotFoundException("Account is registered via Google. Please login with Google")
    }

    const payload = { sub: user.userId, email: user.email, role: user.role };
    const { accessToken } = await this.generateJwtTokens(payload);

    return { ...user, accessToken: accessToken };

  }


  // create doctor 

  async createDoctor(dto: CreateDoctorDto): Promise<DoctorResponseDto> {
    const user = await this.userRepository.findOne({
      where: { userId: dto.user_id },
    });

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
    
    return {available_time_slots:slots};
  }

}



