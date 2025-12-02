// app/admin/carga-roles.tsx
import { useStorage } from '@/hooks/useStorage';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Interfaz para roles extraídos del PDF
interface RolPDF {
  nombre: string;
  matricula: string;
  tipo: 'cocina' | 'aseo';
  fecha: string;
  horario: string;
  estado: 'pendiente';
}

export default function CargaRolesScreen() {
  const router = useRouter();
  const { beneficiarios, agregarBeneficiario, roles } = useStorage();

  const [rolesExtraidos, setRolesExtraidos] = useState<RolPDF[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Simular extracción de datos del PDF (en una app real usarías una librería de PDF)
  const simularExtraccionPDF = (): RolPDF[] => {
    // Esto simula datos extraídos de un PDF
    return [
      { nombre: 'Brenda Vásquez Cruz', matricula: '22105081', tipo: 'cocina', fecha: '', horario: '07:00 - 10:00', estado: 'pendiente' },
      { nombre: 'Ismael Hernández Pérez', matricula: '22105082', tipo: 'aseo', fecha: '', horario: '14:00 - 16:00', estado: 'pendiente' },
      { nombre: 'José Adrián Cruz Cuevas', matricula: '22105083', tipo: 'cocina', fecha: '', horario: '16:00 - 19:00', estado: 'pendiente' },
      { nombre: 'Ana García López', matricula: '22105084', tipo: 'aseo', fecha: '', horario: '14:00 - 16:00', estado: 'pendiente' },
    ];
  };

  // Seleccionar archivo PDF
  const seleccionarPDF = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (resultado.canceled) return;

      Alert.alert(
        'PDF Seleccionado',
        `Archivo: ${resultado.assets[0].name}\n\n¿Procesar roles desde este PDF?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Procesar',
            onPress: () => {
              setProcesando(true);
              // Simulamos procesamiento del PDF
              setTimeout(() => {
                const datosExtraidos = simularExtraccionPDF();
                setRolesExtraidos(datosExtraidos);
                setProcesando(false);
                Alert.alert('Éxito', `Se extrajeron ${datosExtraidos.length} roles del PDF`);
              }, 2000);
            }
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el archivo PDF');
      console.error('Error seleccionando PDF:', error);
    }
  };

  // Asignar fechas automáticamente
  const asignarFechas = () => {
    if (!fechaInicio) {
      Alert.alert('Error', 'Ingresa la fecha de inicio');
      return;
    }

    const fechaBase = new Date(fechaInicio);
    const rolesConFechas = rolesExtraidos.map((rol, index) => {
      const fecha = new Date(fechaBase);
      fecha.setDate(fecha.getDate() + index); // Asignar fechas consecutivas

      return {
        ...rol,
        fecha: fecha.toISOString().split('T')[0]
      };
    });

    setRolesExtraidos(rolesConFechas);
    Alert.alert('Éxito', 'Fechas asignadas automáticamente');
  };

  // Verificar beneficiarios existentes
  const verificarBeneficiarios = () => {
    const beneficiariosFaltantes = rolesExtraidos.filter(rol =>
      !beneficiarios.find(b => b.matricula === rol.matricula)
    );

    if (beneficiariosFaltantes.length > 0) {
      Alert.alert(
        'Beneficiarios Faltantes',
        `Se encontraron ${beneficiariosFaltantes.length} beneficiarios no registrados. ¿Deseas crearlos automáticamente?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Crear Automáticamente',
            onPress: () => crearBeneficiariosFaltantes(beneficiariosFaltantes)
          },
        ]
      );
    } else {
      Alert.alert('Verificación Exitosa', 'Todos los beneficiarios están registrados en el sistema');
    }
  };

  // Crear beneficiarios faltantes automáticamente
  const crearBeneficiariosFaltantes = async (faltantes: RolPDF[]) => {
    try {
      for (const rol of faltantes) {
        await agregarBeneficiario({
          nombre: rol.nombre,
          matricula: rol.matricula,
          activo: true
        });
      }
      Alert.alert('Éxito', `${faltantes.length} beneficiarios creados automáticamente`);
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al crear los beneficiarios');
    }
  };

  // Guardar roles en el sistema
  const guardarRoles = async () => {
    const rolesSinFecha = rolesExtraidos.filter(rol => !rol.fecha);
    if (rolesSinFecha.length > 0) {
      Alert.alert('Error', 'Algunos roles no tienen fecha asignada');
      return;
    }

    Alert.alert(
      'Guardar Roles',
      `¿Guardar ${rolesExtraidos.length} roles en el sistema?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: () => {
            Alert.alert(
              'En Desarrollo',
              'La funcionalidad de guardado de roles estará disponible en la siguiente actualización'
            );
          }
        },
      ]
    );
  };

  // Editar rol individual
  const editarRol = (index: number, campo: string, valor: string) => {
    const rolesActualizados = [...rolesExtraidos];
    rolesActualizados[index] = { ...rolesActualizados[index], [campo]: valor };
    setRolesExtraidos(rolesActualizados);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Carga de Roles desde PDF</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Paso 1: Seleccionar PDF */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Seleccionar PDF de Roles</Text>
          <TouchableOpacity style={styles.pdfButton} onPress={seleccionarPDF}>
            <Ionicons name="document" size={32} color="#ff6a1aff" />
            <Text style={styles.pdfButtonText}>Seleccionar Archivo PDF</Text>
            <Text style={styles.pdfButtonSubtext}>
              {rolesExtraidos.length > 0
                ? `${rolesExtraidos.length} roles cargados`
                : 'Formatos soportados: PDF'
              }
            </Text>
          </TouchableOpacity>

          {procesando && (
            <View style={styles.procesando}>
              <Ionicons name="sync" size={20} color="#FF9800" />
              <Text style={styles.procesandoText}>Procesando PDF...</Text>
            </View>
          )}
        </View>

        {/* Paso 2: Asignar Fechas */}
        {rolesExtraidos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Asignar Fechas</Text>

            <View style={styles.fechaContainer}>
              <Text style={styles.label}>Fecha de Inicio:</Text>
              <TextInput
                style={styles.fechaInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={fechaInicio}
                onChangeText={setFechaInicio}
              />
              <TouchableOpacity style={styles.asignarButton} onPress={asignarFechas}>
                <Text style={styles.asignarButtonText}>Asignar Fechas</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helperText}>
              Las fechas se asignarán automáticamente en orden consecutivo
            </Text>
          </View>
        )}

        {/* Paso 3: Verificar Beneficiarios */}
        {rolesExtraidos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Verificar Beneficiarios</Text>
            <TouchableOpacity style={styles.verificarButton} onPress={verificarBeneficiarios}>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.verificarButtonText}>Verificar en Sistema</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Roles Extraídos */}
        {rolesExtraidos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Roles Extraídos</Text>
              <Text style={styles.rolesCount}>{rolesExtraidos.length} roles</Text>
            </View>

            <FlatList
              data={rolesExtraidos}
              scrollEnabled={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.rolCard}>
                  <View style={styles.rolHeader}>
                    <Text style={styles.rolNombre}>{item.nombre}</Text>
                    <View style={[
                      styles.tipoBadge,
                      { backgroundColor: item.tipo === 'cocina' ? '#FF9800' : '#2196F3' }
                    ]}>
                      <Text style={styles.tipoText}>
                        {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rolDetails}>
                    <Text style={styles.rolMatricula}>Matrícula: {item.matricula}</Text>
                    <Text style={styles.rolHorario}>Horario: {item.horario}</Text>

                    <View style={styles.fechaInputContainer}>
                      <Text style={styles.fechaLabel}>Fecha:</Text>
                      <TextInput
                        style={[
                          styles.fechaInputSmall,
                          !item.fecha && styles.fechaInputError
                        ]}
                        value={item.fecha}
                        onChangeText={(text) => editarRol(index, 'fecha', text)}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                </View>
              )}
            />

            {/* Botón Guardar */}
            <TouchableOpacity style={styles.guardarButton} onPress={guardarRoles}>
              <Ionicons name="save" size={20} color="white" />
              <Text style={styles.guardarButtonText}>Guardar Todos los Roles</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instrucciones */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Instrucciones de Uso:</Text>
          <View style={styles.instruccionItem}>
            <Ionicons name="document" size={16} color="#6B7280" />
            <Text style={styles.instruccionText}>Selecciona el PDF con los roles asignados</Text>
          </View>
          <View style={styles.instruccionItem}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.instruccionText}>Asigna la fecha de inicio para los turnos</Text>
          </View>
          <View style={styles.instruccionItem}>
            <Ionicons name="people" size={16} color="#6B7280" />
            <Text style={styles.instruccionText}>Verifica que todos los beneficiarios existan</Text>
          </View>
          <View style={styles.instruccionItem}>
            <Ionicons name="save" size={16} color="#6B7280" />
            <Text style={styles.instruccionText}>Guarda los roles en el sistema</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ff6a1aff',
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  backButton: {
    padding: 4,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#ff6a1aff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  pdfButton: {
    alignItems: 'center',
    padding: 30,
    borderWidth: 2,
    borderColor: '#ff6a1aff',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
  },
  pdfButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6a1aff',
    marginTop: 8,
    marginBottom: 4,
  },
  pdfButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  procesando: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  procesandoText: {
    color: '#FF9800',
    fontSize: 14,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fechaInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF7ED',
  },
  asignarButton: {
    backgroundColor: '#ff6a1aff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  asignarButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  verificarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ff6a1aff',
    padding: 16,
    borderRadius: 8,
  },
  verificarButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  rolesCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  rolCard: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  rolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  rolNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rolDetails: {
    gap: 4,
  },
  rolMatricula: {
    fontSize: 14,
    color: '#666',
  },
  rolHorario: {
    fontSize: 14,
    color: '#666',
  },
  fechaInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  fechaLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fechaInputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 6,
    padding: 8,
    backgroundColor: 'white',
    fontSize: 14,
  },
  fechaInputError: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  guardarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ff6a1aff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  guardarButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: '#FFF7ED',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6a1aff',
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6a1aff',
    marginBottom: 12,
  },
  instruccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  instruccionText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
});