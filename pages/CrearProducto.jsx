import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  useWindowDimensions,
  Text,
  Image,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Button, Divider, Menu, TextInput } from "react-native-paper";
import { useRef, useReducer, useState, useEffect } from "react";
import {
  requestCameraPermissionsAsync,
  launchCameraAsync,
  launchImageLibraryAsync,
  getCameraPermissionsAsync,
  MediaTypeOptions,
} from "expo-image-picker";
import axios from "axios";

export function CrearProducto() {
  const { width } = useWindowDimensions();

  const [menuVisible, setMenuVisible] = useState(false);
  const [tienePermiso, setTienePermiso] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [ready, setReady] = useState(false);
  /**
   * @type {React.MutableRefObject<FlatList<any>>}
   */
  const flatlistRef = useRef();
  const [prod, setProd] = useReducer(
    (prev, newState) => {
      return { ...prev, ...newState };
    },
    { nombre: "", precio: "", stock: "", imagenes: [] }
  );

  async function subirProducto() {
    const body = new FormData();
    Object.keys(prod).forEach((k) => {
      if (k != "imagenes") {
        console.log(k, prod[k]);
        body.append(k, prod[k]);
      }
    });
    prod.imagenes.forEach(({ type, uri }) => {
      let parts = uri.split("ImagePicker/");
      let name = parts[1];
      body.append("imagenes[]", {
        name,
        type: `${type}/${name.split(".")[1]}`,
        uri,
      });
    });

    console.log(body);
    try {
      const res = await fetch(`${axios.defaults.baseURL}/productos`, {
        method: "post",
        body,
        headers: {
          "Content-Type": "multipart/form-data",
          ...axios.defaults.headers, // token
        },
      });
      const data = await res.json();
      console.log("Upload producto:", data);
    } catch (error) {
      console.warn(error);
    }
  }

  useEffect(() => {
    if (prod.precio && prod.stock && prod.nombre && prod.imagenes.length) {
      setReady(true);
      return;
    }
    setReady(false);
  }, [prod]);

  function alternarMenu() {
    setMenuVisible(!menuVisible);
  }
  useEffect(() => {
    solicitarPermisos();
  }, []);
  async function solicitarPermisos() {
    setCargando(true);
    let cameraPermission = await getCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      cameraPermission = await requestCameraPermissionsAsync();
    }
    setTienePermiso(cameraPermission.granted);
    setCargando(false);
  }

  async function openGallery() {
    alternarMenu();
    const res = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      allowsMultipleSelection: true,
    });
    console.log(res);
    if (!res.cancelled) {
      setProd({ imagenes: [...prod.imagenes, res] });
    }
  }
  function removeImagen(imagen, index) {
    return () => {
      setProd({ imagenes: prod.imagenes.filter((i) => i.uri != imagen.uri) });
      if (index != 0) {
        flatlistRef.current.scrollToIndex({
          index: index - 1,
        });
      }
    };
  }
  async function openCamera() {
    alternarMenu();
    const res = await launchCameraAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
    });
    console.log(res);
    if (!res.cancelled) {
      setProd({ imagenes: [...prod.imagenes, res] });
    }
  }

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={"large"} color="blue" />
      </View>
    );
  }

  if (!cargando && !tienePermiso) {
    return (
      <View style={styles.container}>
        <Text>Nesesita permiso para acceder a la camara y fotos </Text>
        <Button onPress={solicitarPermisos}>Volver a Solicitar Permisos</Button>
      </View>
    );
  }
  return (
    <ScrollView>
      {prod.imagenes.length ? (
        <FlatList
          ref={flatlistRef}
          pagingEnabled={true}
          keyExtractor={(item) => item.uri}
          data={prod.imagenes}
          renderItem={({ item, index }) => (
            <View style={{ position: "relative" }}>
              <TouchableOpacity
                onPress={removeImagen(item, index)}
                style={{
                  position: "absolute",
                  zIndex: 998,
                  right: 5,
                  top: 5,
                  padding: 2,
                  borderRadius: 15,
                  color: "white",
                  backgroundColor: "#333",
                }}
              >
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text
                style={{
                  position: "absolute",
                  zIndex: 999,
                  padding: 5,
                  borderRadius: 5,
                  right: 5,
                  bottom: 5,
                  color: "white",
                  backgroundColor: "#333",
                }}
              >
                {index + 1}/{prod.imagenes.length}
              </Text>
              <Image source={{ uri: item.uri, width, height: width }} />
            </View>
          )}
          horizontal
        />
      ) : null}
      <View style={{ padding: 15, backgroundColor: "#fff" }}>
        <Menu
          visible={menuVisible}
          onDismiss={alternarMenu}
          anchor={
            <Button icon={"camera"} mode="outlined" onPress={alternarMenu}>
              Imagenes
            </Button>
          }
        >
          <Menu.Item onPress={openCamera} title="Tomar Foto" icon={"camera"} />
          <Divider />
          <Menu.Item
            onPress={openGallery}
            title="Buscar en Galeria "
            icon={"image"}
          />
        </Menu>
        <TextInput
          onChangeText={(nombre) => setProd({ nombre })}
          value={prod.nombre}
          style={styles.input}
          label={"Nombre"}
        />
        <TextInput
          onChangeText={(precio) => setProd({ precio })}
          value={prod.precio}
          keyboardType="numeric"
          error={isNaN(prod.precio)}
          style={styles.input}
          label={"Precio"}
        />
        <TextInput
          onChangeText={(stock) => setProd({ stock })}
          keyboardType="numeric"
          value={prod.stock}
          error={isNaN(prod.stock)}
          style={styles.input}
          label={"Cantidad"}
          clearButtonMode={"while-editing"}
        />
        <Button onPress={subirProducto} disabled={!ready}>
          Subir
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  input: {
    backgroundColor: "#fcfcfc",
    marginVertical: 5,
  },
});
