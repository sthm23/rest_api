import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    login: string

    @IsNotEmpty()
    @IsString()
    password: string


    constructor(obj: Partial<CreateUserDto>) {
        Object.assign(this, obj);
    }
}
