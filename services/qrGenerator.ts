// services/qrGenerator.ts

export interface QRData {
  matricula: string;
  nombre: string;
  tipo: 'beneficiario';
  version: string;
  timestamp?: number;
}

export class QRGenerator {
  // Generar datos para el QR
  static generarDatosQR(matricula: string, nombre: string): string {
    const datos: QRData = {
      matricula,
      nombre,
      tipo: 'beneficiario',
      version: '1.0',
      timestamp: Date.now()
    };
    return JSON.stringify(datos);
  }

  // Validar QR escaneado
  static validarQR(contenido: string): { valido: boolean; datos?: QRData; error?: string } {
    try {
      const datos = JSON.parse(contenido) as QRData;

      // Validar estructura
      if (!datos.matricula || !datos.nombre || datos.tipo !== 'beneficiario') {
        return {
          valido: false,
          error: 'QR inválido: estructura incorrecta'
        };
      }

      // Validar matrícula (solo números)
      if (!/^\d+$/.test(datos.matricula)) {
        return {
          valido: false,
          error: 'QR inválido: matrícula incorrecta'
        };
      }

      return { valido: true, datos };
    } catch (error) {
      return {
        valido: false,
        error: 'QR inválido: no se pudo leer'
      };
    }
  }

  // Formatear matrícula para mostrar
  static formatearMatriculaQR(matricula: string): string {
    return `B-${matricula}`;
  }

  // Extraer matrícula del formato QR
  static extraerMatriculaDeQR(codigoQR: string): string | null {
    try {
      const datos = JSON.parse(codigoQR) as QRData;
      return datos.matricula;
    } catch {
      // Si falla el parseo JSON, intentar extraer del formato "B-22105081"
      const match = codigoQR.match(/B-(\d+)/);
      return match ? match[1] : null;
    }
  }
}