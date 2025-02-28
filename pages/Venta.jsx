import axios from "axios";
import { Text, StyleSheet, FlatList, View, Image } from "react-native";
import { Button } from "react-native-paper";
import { useState } from "react";

export function Venta({ route }) {
  let { id, cliente, detalles, entregado, fecha, fechaEntrega } = route.params;
  console.log(id);
  const [fechaentrega, setFechaentrega] = useState(fechaEntrega);
  const [cargando, setcargando] = useState(false);
  const [btnVisible, setBtnVisible] = useState(!entregado);

  async function entregarProducto() {
    setcargando(true);
    try {
      const { data } = await axios.put(`/ventas/${id}`);
      console.log(data);
      if (data.entregado) {
        setFechaentrega(data.fechaEntrega);
        setBtnVisible(false);
      }
    } catch (error) {
      console.warn(error);
    }
    setcargando(false);
  }
  return (
    <>
      <FlatList
        ListHeaderComponent={() => (
          <View style={{ margin: 15 }}>
            <Text style={{ fontSize: 20 }}>Cliente: {cliente.nombre} </Text>
            <Text
              style={[
                { fontSize: 20 },
                !btnVisible ? { color: "green" } : { color: "red" },
              ]}
            >
              Entregado: {!btnVisible ? "Si" : "No"}{" "}
            </Text>
            <Text style={{ fontSize: 20 }}>
              Fecha venta: {new Date(fecha).toLocaleDateString()}
            </Text>
            {fechaentrega ? (
              <Text style={{ fontSize: 20 }}>
                Fecha Entrega: {new Date(fechaentrega).toLocaleDateString()}
              </Text>
            ) : null}
            {btnVisible ? (
              <Button
                loading={cargando}
                onPress={entregarProducto}
                style={{ margin: 15 }}
                mode="contained"
              >
                Marcar como Entregado
              </Button>
            ) : null}
            <Text style={{ fontSize: 20 }}>Productos: </Text>
          </View>
        )}
        data={detalles}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", marginVertical: 10 }}>
            <Image
              style={{ width: 100, height: 100 }}
              source={
                item.producto.imagenes.length
                  ? {
                      uri: item.producto.imagenes[0].imagenUrl,
                    }
                  : require("../assets/helmet.png")
              }
            />
            <View style={{ marginStart: 10 }}>
              <Text> {item.producto.nombre} </Text>
              <Text> Precio: lps. {item.precio} </Text>
              <Text> Total: lps. {item.precio * item.cantidad} </Text>
              <Text> Cantidad: {item.cantidad} </Text>
            </View>
          </View>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
