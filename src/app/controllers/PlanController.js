import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(_req, res) {
    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
    });
    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title } = req.body;

    const planExists = await Plan.findOne({ where: { title } });

    if (planExists) {
      return res.status(400).json({ error: 'Plan already exists!' });
    }

    const { duration, price, id } = await Plan.create(req.body);

    return res.json({ title, duration, price, id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    const inputData = {
      ...req.params,
      ...req.body,
    };

    if (!(await schema.isValid(inputData))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, title } = inputData;
    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    if (title && title !== plan.title) {
      const planExists = await Plan.findOne({ where: { title } });
      if (planExists) {
        return res.status(400).json({ error: 'Plan already exists!' });
      }
    }

    const { duration, price } = await plan.update(req.body);

    return res.json({ id, title: plan.title, duration, price });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' });
    }

    plan.destroy();
    return res.send();
  }
}

export default new PlanController();