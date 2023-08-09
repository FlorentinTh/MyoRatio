import * as yup from 'yup';

import { TypeHelper } from '../helpers/type-helper';

export class MuscleModel {
  #data;
  #schema = yup.object().shape({
    id: yup.string().trim().required(),
    label: yup.string().trim().required()
  });

  constructor(data) {
    TypeHelper.checkObject(data, { label: 'data' });

    this.#data = data;
  }

  get schema() {
    return this.#schema;
  }

  async validate() {
    try {
      await this.#schema.validate(this.#data);
    } catch (error) {
      throw new Error(error.toString().split(':')[1]);
    }

    return this.#data;
  }
}
