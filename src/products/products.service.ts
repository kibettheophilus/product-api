import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Product>> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;

    // Build query with filters
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Apply category filter
    if (options?.category) {
      queryBuilder.andWhere('LOWER(product.category) LIKE LOWER(:category)', {
        category: `%${options.category}%`,
      });
    }

    // Apply tags filter - match any of the provided tags
    if (options?.tags && options.tags.length > 0) {
      const tagConditions = options.tags.map((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
        return `LOWER(product.tags) LIKE LOWER(:tag${index})`;
      });
      queryBuilder.andWhere(`(${tagConditions.join(' OR ')})`);
    }

    // Apply pagination and ordering
    queryBuilder.orderBy('product.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id); // Check if product exists
    this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
  }
}
