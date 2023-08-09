import * as yup from 'yup';

import { TypeHelper } from '../helpers/type-helper';

export class AnalysisModel {
  #data;
  #schema = yup.object().shape({
    id: yup.string().trim().required(),
    label: yup.string().trim().required(),
    stages: yup.object({
      concentric: yup.object({
        label: yup.string().trim(),
        opening: yup.boolean().required()
      }),
      eccentric: yup.object({
        label: yup.string().trim(),
        opening: yup.boolean().required()
      })
    }),
    muscles: yup.object({
      antagonist: yup.string().trim().required(),
      agonist: yup.string().trim().required(),
      angle: yup.string().trim().required()
    }),
    is_angle_advanced: yup.boolean().required()
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
