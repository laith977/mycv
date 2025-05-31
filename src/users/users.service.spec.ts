import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repo: Partial<Record<keyof Repository<User>, jest.Mock>>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'password123',
  } as User;

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      findOneBy: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
      findBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should create and save a user', async () => {
      const result = await service.create('test@example.com', 'password123');
      expect(repo.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(repo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne()', () => {
    it('should return a user by id', async () => {
      repo.findOneBy!.mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });
  });

  describe('find()', () => {
    it('should return users with matching email', async () => {
      const users = [mockUser];
      repo.find!.mockResolvedValue(users);
      const result = await service.find('test@example.com');
      expect(repo.find).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(users);
    });
  });

  describe('update()', () => {
    it('should update and return the user', async () => {
      repo.findOneBy!.mockResolvedValue({ ...mockUser });
      const updatedUser = { ...mockUser, email: 'updated@example.com' };
      repo.save!.mockResolvedValue(updatedUser);
      const result = await service.update(1, { email: 'updated@example.com' });
      expect(result).toEqual(updatedUser);
    });

    it('should throw if user not found', async () => {
      repo.findOneBy!.mockResolvedValue(null);
      await expect(
        service.update(2, { email: 'nope@example.com' }),
      ).rejects.toThrow('User not found');
    });
  });

  describe('remove()', () => {
    it('should remove and return the user', async () => {
      const users = [mockUser];
      repo.findBy!.mockResolvedValue(users);
      repo.remove!.mockResolvedValue(mockUser);
      const result = await service.remove(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      repo.findBy!.mockResolvedValue([]);
      await expect(service.remove(2)).rejects.toThrow('User not found');
    });
  });
});
