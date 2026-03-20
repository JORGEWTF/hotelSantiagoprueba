export interface User {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
    cargo: string;
    // Agrega otros campos que retornen tu backend
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface RegisterData {
    nombre: string;
    apellido: string;
    carnet: number;
    celular: number;
    genero: string;
    password: string;
}
