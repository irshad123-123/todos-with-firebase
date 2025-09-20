let cl = console.log;

const todoForm = document.getElementById('todoForm')
const todoItemControler = document.getElementById('todoItem')
const addTodo = document.getElementById('addTodo')
const updateTodo = document.getElementById('updateTodo')
const todoContainer = document.getElementById('todoContainer')
const loader = document.getElementById('loader')

const snackBar = (msg, icon) =>{
    Swal.fire({
        title : msg,
        icon : icon,
        timer : 2000
    })
}

let BASE_URL = `https://crud-35fc1-default-rtdb.asia-southeast1.firebasedatabase.app`
let TODO_URL = `${BASE_URL}/todos.json`

const objtoArr = (obj) => {
    let todoArr = []
    for (const key in obj) {
        todoArr.unshift({ ...obj[key], id: key })
    }
    return todoArr
}

const todoTemplating = (arr) => {
    let result = ``
    arr.forEach(f => {
        result += `<li id="${f.id}" class="list-group-item d-flex justify-content-between align-items-center">
                        <strong>${f.todoItem}</strong>
                        <div>
                            <i onclick="onEdit(this)" class="fa-solid fa-user-pen fa-2x text-success" role="button"></i>
                            <i onclick="onRemove(this)" class="fa-solid fa-trash fa-2x text-danger" role="button"></i>
                        </div>
                    </li>`
    })
    todoContainer.innerHTML = result;
}

const onEdit = async (ele) => {
    let Edit_Id = ele.closest('li').id
    cl(Edit_Id)
    localStorage.setItem('Edit_Id', Edit_Id)
    let Edit_URL = `${BASE_URL}/todos/${Edit_Id}.json`
    let res = await makeApiCall('GET', Edit_URL, null)
    todoItemControler.value = res.todoItem

    addTodo.classList.add('d-none')
    updateTodo.classList.remove('d-none')
    snackBar('The data is patch successfully', 'success')
}

const onRemove = async (ele) =>{
  let data = await  Swal.fire({
  title: "Do you want to Remove this todo?",
  showDenyButton: true,
  confirmButtonText: "Remove",
}).then((result) => {
  /* Read more about isConfirmed, isDenied below */
  if (result.isConfirmed) {
    let Remove_Id = ele.closest('li').id;
    cl(Remove_Id)
    let Remove_URL = `${BASE_URL}/todos/${Remove_Id}.json`
    makeApiCall('DELETE', Remove_URL, null)
    ele.closest('li').remove()
  }
});

}

const makeApiCall = async (methodName, api_url, msgBody) => {
    msgBody = msgBody ? JSON.stringify(msgBody) : null
    loader.classList.remove('d-none')
    let res = await fetch(api_url, {
        method: methodName,
        body: msgBody,
        headers: {
            "auth": "JWT token form LS",
            "content-type": "application/json"
        }
    })
    try {
        if (!res.ok) {
            throw new Error('Network Error')
        }
        return res.json()
    } catch {
        cl('Error')
    } finally {
        loader.classList.add('d-none')
    }
}

const makeAllTodo = async () => {
    let res = await makeApiCall('GET', TODO_URL, null)
    let posts = objtoArr(res)
    todoTemplating(posts)
}

makeAllTodo()

const onAddTodo = async (eve) => {
    eve.preventDefault()
    let obj = {
        todoItem: todoItemControler.value
    }
    cl(obj)
    
    let res = await makeApiCall('POST', TODO_URL, obj)  
    snackBar('The data is added successfully', 'success')
    todoForm.reset()
    let newId = res.name;
    obj.id = newId
    let li = document.createElement('li')
    li.className = `list-group-item d-flex justify-content-between align-items-center`
    li.id = obj.id
    li.innerHTML = `<strong>${obj.todoItem}</strong>
                        <div>
                            <i onclick="onEdit(this)" class="fa-solid fa-user-pen fa-2x text-success" role="button"></i>
                            <i onclick="onRemove(this)" class="fa-solid fa-trash fa-2x text-danger" role="button"></i>
                        </div>`
    todoContainer.prepend(li)

}

const onUpdateTodo = async (eve) => {
    let Update_Id = localStorage.getItem('Edit_Id')
    cl(Update_Id)
    let Update_URL = `${BASE_URL}/todos/${Update_Id}.json`
    let UPdate_Obj = {
        todoItem: todoItemControler.value,
        id : Update_Id
    }
    todoForm.reset()
    let res = await makeApiCall('PATCH', Update_URL, UPdate_Obj)
    snackBar('The data is Updated successfully', 'success')
    let li = document.getElementById(Update_Id)
    let strong = li.querySelector('strong')
    // cl(strong)
    strong.innerHTML = res.todoItem

    addTodo.classList.remove('d-none')
    updateTodo.classList.add('d-none')
}

todoForm.addEventListener('submit', onAddTodo)

updateTodo.addEventListener('click', onUpdateTodo)