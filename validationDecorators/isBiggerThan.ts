import { ValidationOptions, registerDecorator, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator"

export function IsBiggerThan(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsBiggerThanConstraint
        });
    };
}

@ValidatorConstraint({ name: "isBiggerThan" })
export class IsBiggerThanConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        return value > relatedValue
    }
}
