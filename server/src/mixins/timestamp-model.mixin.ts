import {MixinTarget} from '@loopback/core';
import {property} from '@loopback/repository';

export function TimestampMixin<T extends MixinTarget<object>>(baseEntity: T) {
  class MixedModel extends baseEntity {
    @property({
      type: 'date',
      defaultFn: 'now',
      postgresql: {
        dataType: 'timestamp with time zone',
      },
    })
    createdAt?: Date;

    @property({
      type: 'date',
      defaultFn: 'now',
      postgresql: {
        dataType: 'timestamp with time zone',
      },
    })
    updatedAt?: Date;
  }

  return MixedModel;
}
