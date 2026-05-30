import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class StringToLowercasePipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }

    return value;
  }
}
