import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsIn,
  MinLength,
  MaxLength,
  IsNumber,
  Matches,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  password: string;

  @IsOptional()
  @IsIn(['Admin', 'User'])
  role?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(150)
  age?: number;

  @IsOptional()
  @Matches(/^(05|\+9705|\+9725|009705|009725)\d{7,8}$/, {
    message: 'phoneNumber must be a valid Palestinian mobile number',
  })
  phoneNumber?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  verificationCode?: string;

  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;
}
