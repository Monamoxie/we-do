import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:9090/api';

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        filter: 'all',
        todos: [
            // {
            //     'id': 1,
            //     'title': 'First task for the day',
            //     'completed': false,
            //     'editing': false,
            // },
            //     {
            //     'id': 2,
            //     'title': 'Second task for the day',
            //     'completed': false,
            //     'editing': false,
            // },
            //     {
            //     'id': 3,
            //     'title': 'Third task for the day',
            //     'completed': false,
            //     'editing': false,
            // },
        ]
    },

    getters: {
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
        }
    },

    actions: {
        retrieveTodos(context) {
            axios.get('/todos')
            .then(response => {
                context.commit('retrieveTodos', response.data)
            })
            .catch(errors => {
                console.log(errors)
            })
        },
        addTodo(context, todo) {

            axios.post('/todos', {
                title: todo.title,
                completed: todo.completed
            })
            .then(response => {
                context.commit('addTodo', response.data)
            })
            .catch(errors => {
                console.log(errors)
            })
        },

        clearCompleted(context) {
            
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
          
            axios.delete('/todos/' + id)
            .then(() => {
                context.commit('deleteTodo', id)
            })
            .catch(errors => {
                console.log(errors)
            })
        },

        updateTodo(context, todo) {
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
        }
    }
})