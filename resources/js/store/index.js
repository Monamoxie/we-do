import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

axios.defaults.baseURL = process.env.MIX_APP_API_URL

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        token: localStorage.getItem('access_token') || null,
        filter: 'all',
        todosLoading: true,
        newTodoLoading: false,
        todos: []
    },

    getters: {
        loggedIn(state) {
            return state.token !== null
        },
        remaining(state) {
            return state.todos.filter(todo => !todo.completed).length
        },

        anyRemaining(state, getters) {
            return getters.remaining != 0
        }, 

        todosFiltered(state) { 
            
            if (state.filter === 'active') return state.todos.filter(todo => !todo.completed) 
            else if (state.filter === 'completed') return state.todos.filter(todo => todo.completed) 

            return state.todos 
        },
        
        showClearCompletedButton(state) {
            // returns a sub array in todos where any of the todo has a completed property set to true. 
            // count all and show the button if lenght > 0
            return state.todos.filter(todo => todo.completed).length > 0
          
        }
    },

    mutations: {
        addTodo(state, todo) {
            state.todos.push({
                id: todo.id,
                title: todo.title,
                completed: todo.completed,
                editing: todo.editing
            })
        },
        clearCompleted(state) {
            state.todos = state.todos.filter(todo => todo.completed == false) 
        },
        updateFilter(state, filter) {
            state.filter = filter 
        },
        checkAll(state, checked) {
            state.todos.forEach((todo) => todo.completed = checked)
        },
        deleteTodo(state, id) {
            const index = state.todos.findIndex(item => item.id == id)
            state.todos.splice(index, 1)
        },
        updateTodo(state, todo) {
            const index = state.todos.findIndex(item => item.id == todo.id)
            state.todos.splice(index, 1, {
                'id': todo.id,
                'title': todo.title,
                'completed': todo.completed,
                'editing': todo.editing
            })
        },
        retrieveTodos(state, todos) {
            state.todos = todos 
        },
        retrieveToken(state, token) {
            state.token = token
        },
        destroyToken(state) {
            state.token = null
        },
        clearTodos(state) {
            state.todos = []
        }
    },

    actions: {
        register(context, credentials) {
            return new Promise((resolve, reject) => {
                axios.post('/register', {
                    name: credentials.name,
                    email: credentials.email,
                    password: credentials.password
                })
                .then(response => { 
                    resolve(response)
                })
                .catch(errors => {
                    console.log(errors)
                    reject(errors)
                })
            })
        },
        retrieveToken(context, credentials) {
            return new Promise((resolve, reject) => {
                axios.post('/login', {
                    email: credentials.email,
                    password: credentials.password
                })
                .then(response => { 
                    const token = response.data.token
                    localStorage.setItem('access_token', token) 
                    context.commit('retrieveToken', token)
                    resolve(response)
                })
                .catch(errors => {
                    console.log(errors)
                    reject(errors)
                })
            })
        },
        destroyToken(context) { 
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token

            if (context.getters.loggedIn) {
                return new Promise((resolve, reject) => {
                    axios.post('/logout')
                    .then(response => {  
                        localStorage.removeItem('access_token') 
                        context.commit('destroyToken')
                        resolve(response)
                    })
                    .catch(errors => {
                        context.commit('destroyToken')
                        reject(errors)
                    })
                })
            }
        },
        retrieveTodos(context) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token
            context.state.todosLoading = true
            axios.get('/todos')
            .then(response => {
                context.state.todosLoading = false
                context.commit('retrieveTodos', response.data)
            })
            .catch(errors => {
                console.log(errors)
            })
        },
        addTodo(context, todo) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token
            context.state.newTodoLoading = true
            axios.post('/todos', {
                title: todo.title,
                completed: todo.completed
            })
            .then(response => {
                context.state.newTodoLoading = false
                context.commit('addTodo', response.data)
            })
            .catch(errors => {
                console.log(errors)
            })
        },
        clearCompleted(context) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token
            // How to use filter and mpa to return the id of the completed
            const completed = store.state.todos
            .filter(todo => todo.completed == true)
            .map(todo => todo.id)
             
            axios.delete('/todos/delete/completed', {
                data: {
                    todos: completed
                }
            })
            .then(() => {
                context.commit('clearCompleted')
            })
            .catch(errors => {
                console.log(errors)
            })
        },
        updateFilter(context, filter) {
            context.commit('updateFilter', filter)
        },
        checkAll(context, checked) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token
            axios.patch('/todos/check/all', {
                completed: checked
            })
            .then(() => {
                context.commit('checkAll', checked)
            })
            .catch(errors => {
                console.log(errors)
            })
        },

        deleteTodo(context, id) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token
            axios.delete('/todos/' + id)
            .then(() => {
                context.commit('deleteTodo', id)
            })
            .catch(errors => {
                console.log(errors)
            })
        },

        updateTodo(context, todo) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token
            axios.patch('/todos/' + todo.id, {
                title: todo.title,
                completed: todo.completed
            })
            .then(response => {
                context.commit('updateTodo', response.data)
            })
            .catch(errors => {
                console.log(errors)
            })
        },

        clearTodos(context) {
            context.commit('clearTodos')
        },

        retrieveName(context) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token
            return new Promise((resolve, reject) => {
                axios.get('/user')
                .then(response => { 
                    resolve(response)
                })
                .catch(errors => {
                    console.log(errors)
                    reject(errors)
                })
            })
        }
    }
})