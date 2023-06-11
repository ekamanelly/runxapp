module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'database_name',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
};
