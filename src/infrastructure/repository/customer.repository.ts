import Address from "../../domain/entity/address";
import Customer from "../../domain/entity/customer";
import RepositoryInterface from "../../domain/repository/repository-interface";
import CustomerModel from "../db/sequelize/model/customer.model";

export default class CustomerRepository implements RepositoryInterface<Customer> {
    async create(entity: Customer): Promise<void> {
        await CustomerModel.create({
            id: entity.id,
            name: entity.name,
            street: entity.address.street,
            zipcode: entity.address.zip,
            city: entity.address.city,
            active: entity.isActivate(),
            rewardPoints: entity.rewardPoints
        });
    }

    async update(entity: Customer): Promise<void> {
        await CustomerModel.update({
            id: entity.id,
            name: entity.name,
            street: entity.address.street,
            zipcode: entity.address.zip,
            city: entity.address.city,
            active: entity.isActivate(),
            rewardPoints: entity.rewardPoints
        }, {
            where: {
                id: entity.id,
            }
        });
    }

    async find(id: string): Promise<Customer> {
        let customerModel;

        try {
            customerModel = await CustomerModel.findOne({
                where: {id},
                rejectOnEmpty: true
            });
        } catch (err) {
            throw new Error("Customer not found");
        }

        const customer = new Customer(id, customerModel.name);
        const address = new Address(
            customerModel.street,
            customerModel.number,
            customerModel.zipcode,
            customerModel.city
        );

        customer.changeAddress(address);
        return customer;
    }

    async findAll(): Promise<Customer[]> {
        const customerModels = await CustomerModel.findAll();
        const customers = customerModels.map(customerModels => {
            let customer = new Customer(customerModels.id, customerModels.name);
            customer.addRewardPoints(customerModels.rewardPoints);
            const address = new Address(
                customerModels.street,
                customerModels.number,
                customerModels.zipcode,
                customerModels.city
            );
            customer.changeAddress(address);

            if (customerModels.active) {
                customer.activate();
            }

            return customer;
        });

        return customers;
    }
}