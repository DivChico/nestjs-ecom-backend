import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  // - @UseGuards(JwtAuthGuard, RolesGuard)
  // - @Roles('Admin')
  // JwtAuthGuard first: validates Bearer token from Authorization header
  // RolesGuard second: checks req.user.role === 'Admin'
  // Both must pass; if token invalid → 401, if wrong role → 403
  // import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  // import { RolesGuard } from '../auth/roles.guard';
  // import { Roles } from '../auth/roles.decorator';
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // Guards would go here too — any authenticated user can view their own profile
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
