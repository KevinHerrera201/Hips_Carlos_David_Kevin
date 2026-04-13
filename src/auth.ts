import { pool } from "./db";

export async function login(usuario: string, password: string) {
  try {
    const res = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1 AND password = $2",
      [usuario, password]
    );

    if (res.rows.length > 0) {
      return {
        success: true,
        message: "Login correcto",
        user: res.rows[0],
      };
    } else {
      return {
        success: false,
        message: "Usuario o contraseña incorrectos",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Error en el servidor",
    };
}

//Registo
  }
export async function register(usuario: string, password: string, rol: string) {
  try {
    const res = await pool.query(
      "INSERT INTO usuarios (usuario, password, rol) VALUES ($1, $2, $3) RETURNING *",
      [usuario, password, rol]
    );

    return {
      success: true,
      message: "Usuario registrado correctamente",
      user: res.rows[0],
    };
  } catch (error) {
    return {
      success: false,
      message: "Error: el usuario ya existe",
    };
  }
}