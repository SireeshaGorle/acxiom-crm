import * as customerService from '../services/customerService.js';
import { validateCustomer } from '../validators/customerValidators.js';
import { successResponse, paginatedResponse, errorResponse } from '../utils/apiResponse.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const result = await customerService.getCustomers({
      page,
      limit,
      search,
      status,
      user: req.user
    });

    return paginatedResponse(res, result.customers, {
      page: result.page,
      limit: result.limit,
      total: result.total
    }, 'Customers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id, req.user);
    return successResponse(res, customer, 'Customer retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const validation = validateCustomer(req.body);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const newCustomer = await customerService.createCustomer(req.body, req.user, ipAddress);

    return successResponse(res, newCustomer, 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const validation = validateCustomer(req.body, true);
    if (!validation.isValid) {
      return errorResponse(res, 'Validation failed', 400, validation.errors);
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const updatedCustomer = await customerService.updateCustomer(req.params.id, req.body, req.user, ipAddress);

    return successResponse(res, updatedCustomer, 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await customerService.deleteCustomer(req.params.id, req.user, ipAddress);

    return successResponse(res, null, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};
