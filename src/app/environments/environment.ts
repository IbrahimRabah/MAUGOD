interface Environment {
  production: boolean;
  apiUrl: string;
  logging: boolean;

}

export const environment:Environment = {
  production: false,
  apiUrl: 'http://localhost:5050',
  logging: true,
};
