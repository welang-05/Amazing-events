const { createApp } = Vue;

createApp({
    data() {
        return {
            search: '',
            Checkeados: [],
            data: [],
            dataFiltrada: [],
            direccion: '',
            categorias: '',
            cartaDetails: {},
            MayAsis: {},
            MenAsis: {},
            MayCap: {},
            RevAtten: [],
            RevEstimate: [],
            fondomax: '',
            dianoche: 'Noche',
        }
    },
    created() {
        fetch('https://amazing-events.herokuapp.com/api/events')
            .then((response) => response.json())
            .then((json) => {
                this.data = json;
                this.fondomax = this.data.events[0].image;
                this.direccion = window.location.href;

                let estiloEnStorage = JSON.parse(localStorage.getItem('estilo'))
                if (estiloEnStorage) {
                    this.dianoche = estiloEnStorage;
                }
                this.estiloDiaNoche()

                if (this.direccion.includes("e_")) { //Si estamos en "e_upcoming.html" o en "e_past.html"
                    this.data.events = this.filtrarPasadoFuturo(this.direccion); //Fitrar eventos por pasado o futuro
                    this.dataFiltrada = this.data.events;

                    this.categorias = this.ExtraerCatCheck(this.data.events);
                } else if (this.direccion.includes("index")) { //Si estamos en la página principal
                    this.categorias = this.ExtraerCatCheck(this.data.events);
                    this.dataFiltrada = this.data.events;
                    console.log(this.dataFiltrada);
                } else if (this.direccion.includes("details")) {
                    this.Detalles();
                } else {
                    this.Estadísticas();
                }
            })
            .catch((error) => console.log(error))
    },
    mounted() { },
    methods: {
        //Filtro si estamos en eventos pasados o futuros
        filtrarPasadoFuturo(pasadoFuturo) {
            if (pasadoFuturo.includes("past")) {
                return this.data.events.filter(elementos => elementos.date < this.data.currentDate);
            } else {
                return this.data.events.filter(elementos => elementos.date > this.data.currentDate);
            }
        },
        //Función para extraer las categorías
        ExtraerCatCheck(array) {
            let categ = [];
            let categShort = [];
            array.forEach((i) => { categ.push(i.category) })
            categ.forEach((c) => {
                if (!categShort.includes(c)) {
                    categShort.push(c);
                }
            });
            return categShort.sort();
        },
        //Función para details
        Detalles() {
            var idCarta = location.search.split("?id=").join("");
            this.cartaDetails = this.data.events.filter(datos => datos._id == idCarta)[0];
        },
        //Función para estadísticas
        Estadísticas() {
            let dataPasado = this.filtrarPasadoFuturo("past");
            let dataFuturo = this.filtrarPasadoFuturo("futuro");
            this.MayAsis = this.obtenerMayor(dataPasado.map(a => a.assistance * 100 / a.capacity), dataPasado); //Evento con mayor % asistencia
            this.MenAsis = this.obtenerMenor(dataPasado.map(a => a.assistance * 100 / a.capacity), dataPasado); //Evento con menor % asistencia
            this.MayCap = this.obtenerMayor(this.data.events.map(a => a.capacity), this.data.events) //Evento con mayor capacidad
            this.RevAtten = this.RevenuesAttendance(dataPasado, this.ExtraerCatCheck(dataPasado).sort()); //Revenues y asistencia por categoría pasado
            this.RevEstimate = this.RevenuesAttendance(dataFuturo, this.ExtraerCatCheck(dataFuturo).sort()); //Revenues y asistencia estimada por categoría futuro
        },
        //Función obtener datos de evento con mayor número algo
        obtenerMayor(arrayValores, Eventos) {
            let mayor = Number(arrayValores[0]);
            let DatosMayor = {
                name: "",
                cantidad: 0,
                image: ""
            };
            arrayValores.forEach((valor, i) => {
                if (Number(valor) > mayor) {
                    mayor = Number(valor);
                    DatosMayor.name = Eventos[i].name;
                    DatosMayor.image = Eventos[i].image;
                    DatosMayor.cantidad = mayor;
                }
            })
            return DatosMayor;
        },
        //Función obtener datos de evento con menor número de algo
        obtenerMenor(arrayValores, Eventos) {
            let menor = Number(arrayValores[0]);
            let DatosMenor = {
                name: "",
                cantidad: 0,
                image: ""
            };
            arrayValores.forEach((valor, i) => {
                if (Number(valor) < menor) {
                    menor = Number(valor);
                    DatosMenor.name = Eventos[i].name;
                    DatosMenor.image = Eventos[i].image;
                    DatosMenor.cantidad = menor;
                }
            })
            return DatosMenor;
        },
        //Revenues & Porcentage of attendance
        RevenuesAttendance(arrayEventos, categories) {
            let estadisticCategories = [];
            categories.forEach((categ, i) => {
                estadisticCategories.push(
                    {
                        Category: categ,
                        Attendance: 0,
                        Capacity: 0,
                        PercentAtten: 0,
                        Revenues: 0
                    }
                )
                arrayEventos.forEach(evento => {
                    if (categ == evento.category) {
                        if (evento.assistance != null) {
                            estadisticCategories[i].Attendance += Number(evento.assistance);
                            estadisticCategories[i].Capacity += Number(evento.capacity);
                            estadisticCategories[i].Revenues += Number(evento.price) * Number(evento.assistance);
                        } else {
                            estadisticCategories[i].Attendance += Number(evento.estimate);
                            estadisticCategories[i].Capacity += Number(evento.capacity);
                            estadisticCategories[i].Revenues += Number(evento.price) * Number(evento.estimate);
                        }
                    }
                });
                estadisticCategories.forEach(arr => {
                    arr.PercentAtten = ((100 * Number(arr.Attendance) / Number(arr.Capacity))).toFixed(2);
                })
            });
            return estadisticCategories;
        },
        estiloDiaNoche() {
            if (this.dianoche == 'Noche') {
                var bodyStyles = document.body.style;
                bodyStyles.setProperty('--fondo', 'white');
                bodyStyles.setProperty('--texto', 'black');
                bodyStyles.setProperty('--altura', '700px');
                bodyStyles.setProperty('--ancho', '500px');
                this.dianoche='Día';
                localStorage.setItem('estilo', JSON.stringify(this.dianoche));
            } else {
                var bodyStyles = document.body.style;
                bodyStyles.setProperty('--fondo', '#1e90ff');
                bodyStyles.setProperty('--texto', 'white');
                bodyStyles.setProperty('--altura', '200px');
                bodyStyles.setProperty('--ancho', '600px');
                this.dianoche = 'Noche';
                localStorage.setItem('estilo', JSON.stringify(this.dianoche));
            }
        }
        
    },
    computed: {
        Busqueda() {
            if (this.search.length != 0) {
                this.dataFiltrada = this.data.events.filter(a => (a.name + a.description + a.category).toLowerCase().includes(this.search.toLowerCase()));
            } else {
                this.dataFiltrada = this.data.events;
            }
            if (this.Checkeados.length != 0) {
                let aux = [];
                for (i = 0; i < this.dataFiltrada.length; i++) {
                    if (this.Checkeados.includes(this.dataFiltrada[i].category)) {
                        aux.push(this.dataFiltrada[i]);
                    }
                }
                this.dataFiltrada = aux;
            }
        }
    }
}).mount('#app')
