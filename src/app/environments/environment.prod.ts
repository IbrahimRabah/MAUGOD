interface Environment {
  production: boolean;
  apiUrl: string;
  logging: boolean;

}

export const environment:Environment = {
  production: true,
  apiUrl: 'http://localhost:5050',
  logging: true,

};
