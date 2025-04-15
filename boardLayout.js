function getBoardIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("boardId"));
}

function getCurrentUser() {
  const currentUserId = parseInt(localStorage.getItem("currentUserId"));
  const usersData = JSON.parse(localStorage.getItem("usersData")) || { users: [] };
  return usersData.users.find(u => u.id === currentUserId);
}

function saveCurrentUser(updatedUser) {
  const usersData = JSON.parse(localStorage.getItem("usersData")) || { users: [] };
  const updatedUsers = usersData.users.map(user => 
    user.id === updatedUser.id ? updatedUser : user
  );
  localStorage.setItem("usersData", JSON.stringify({ users: updatedUsers }));
}

document.addEventListener("DOMContentLoaded", () => {
  const boardId = getBoardIdFromURL();
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    Swal.fire({ icon: "error", title: "Session expired" }).then(() => {
      window.location.href = "sign-in.html";
    });
    return;
  }

  const board = currentUser.boards.find(b => b.id === boardId);
  
  if (!board) {
    Swal.fire({ icon: "error", title: "Board not found" }).then(() => {
      window.location.href = "dashboard.html";
    });
    return;
  }

  setupBoardUI(board);
  
  renderBoardContent(board, currentUser);
  
  setupEventListeners(board, currentUser);
});

function setupBoardUI(board) {
  document.querySelector(".dashboard-title").textContent = board.title;
  const mainContent = document.querySelector("main.content");
  
  if (board.backdrop) {
    mainContent.style.backgroundImage = `url(${board.backdrop})`;
  } else if (board.color) {
    mainContent.style.background = board.color;
  }
}

function renderBoardContent(board, currentUser) {
  const boardContent = document.getElementById("boardContent");
  boardContent.innerHTML = ''; 
  
  board.lists.forEach(list => {
    const listDiv = createListElement(list);
    boardContent.appendChild(listDiv);
    
    setupTaskFunctionality(listDiv, list, board, currentUser);
  });
  
  const addListBtn = document.createElement("button");
  addListBtn.className = "add-another-list-btn board-list";
  addListBtn.id = "addListBtn";
  addListBtn.textContent = "+ Add another list";
  boardContent.appendChild(addListBtn);
}

function createListElement(list) {
  const listDiv = document.createElement("div");
  listDiv.className = "board-list";
  listDiv.innerHTML = `
    <div class="list-header">
      <p class="list-title">${list.title}</p>
      <div class="list-actions">
        <i class="fas fa-compress-alt"></i>
        <i class="fas fa-ellipsis-h"></i>
      </div>
    </div>
    <ul class="task-list">
      ${list.tasks.map(task => `
        <li class="task-item" data-task-id="${task.id}">
          <i class="far ${task.completed ? 'fa-check-circle checked' : 'fa-circle'}"></i>
          ${task.title}
        </li>
      `).join("")}
    </ul>
    <div class="add-task">
      <p class="add-card-btn">+ Add a card</p>
      <i class="far fa-edit edit-card-btn"></i>
    </div>
  `;
  return listDiv;
}

function setupEventListeners(board, currentUser) {
  setupAddListFunctionality(board, currentUser);
  setupFilterModal();
  setupMoveCardModal();
  setupCreateLabelModal();
  setupCardDetailFunctionality(board, currentUser);
  setupCloseBoardFunctionality(currentUser);
}

function setupAddListFunctionality(board, currentUser) {
  const boardContent = document.getElementById("boardContent");
  const addListBtn = document.getElementById("addListBtn");
  
  addListBtn.addEventListener("click", () => {
    addListBtn.style.display = "none";
    
    const formDiv = document.createElement("div");
    formDiv.className = "add-list-form board-list";
    formDiv.innerHTML = `
      <div class="input-wrapper">
        <input type="text" name="nameList" id="nameList" class="input" placeholder=" " />
        <label for="nameList" class="label">Enter list name</label>
      </div>
      <div class="add-list-actions">
        <button class="add-list-btn btn fill" id="submitListBtn">Add list</button>
        <i class="fa-regular fa-rectangle-xmark close-add-list" id="closeListBtn"></i>
      </div>
    `;
    
    boardContent.insertBefore(formDiv, addListBtn);
    
    document.getElementById("submitListBtn").addEventListener("click", () => {
      const listName = document.getElementById("nameList").value.trim();
      
      if (!listName) {
        Swal.fire({ icon: "error", title: "List name cannot be empty" });
        return;
      }
      
      const newList = { title: listName, tasks: [] };
      board.lists.push(newList);
      saveCurrentUser(currentUser);
      
      renderBoardContent(board, currentUser);
      setupEventListeners(board, currentUser);
    });
    
    document.getElementById("closeListBtn").addEventListener("click", () => {
      formDiv.remove();
      addListBtn.style.display = "inline-block";
    });
  });
}

function setupTaskFunctionality(listDiv, list, board, currentUser) {
  const addCardBtn = listDiv.querySelector(".add-card-btn");
  const editCardBtn = listDiv.querySelector(".edit-card-btn");
  const taskList = listDiv.querySelector(".task-list");
  
  addCardBtn.addEventListener("click", () => {
    addCardBtn.style.display = "none";
    editCardBtn.style.display = "none";
    
    const taskInputDiv = document.createElement("div");
    taskInputDiv.className = "input-wrapper";
    taskInputDiv.innerHTML = `
      <input type="text" class="input" placeholder=" " />
      <label class="label">Enter a title</label>
      <div class="add-list-actions">
        <button class="add-list-btn btn fill">Add Card</button>
        <i class="fa-regular fa-rectangle-xmark close-add-list"></i>
      </div>
    `;
    
    taskList.appendChild(taskInputDiv);
    taskInputDiv.querySelector("input").focus();
    
    const input = taskInputDiv.querySelector("input");
    const addBtn = taskInputDiv.querySelector("button");
    const closeBtn = taskInputDiv.querySelector("i");
    
    addBtn.addEventListener("click", () => {
      const taskName = input.value.trim();
      
      if (!taskName) {
        Swal.fire({ icon: "error", title: "Task name cannot be empty" });
        return;
      }
      
      const newTask = {
        id: Date.now(),
        title: taskName,
        completed: false,
        description: "",
        dueDate: null,
        labels: []
      };
      
      list.tasks.push(newTask);
      saveCurrentUser(currentUser);
      
      const newListDiv = createListElement(list);
      listDiv.parentNode.replaceChild(newListDiv, listDiv);
      setupTaskFunctionality(newListDiv, list, board, currentUser);
    });
    
    closeBtn.addEventListener("click", () => {
      taskInputDiv.remove();
      addCardBtn.style.display = "inline-block";
      editCardBtn.style.display = "inline-block";
    });
  });
  
  listDiv.querySelectorAll(".task-item").forEach(taskItem => {
    taskItem.addEventListener("click", (e) => {
      if (e.target.classList.contains("fa-circle") || 
          e.target.classList.contains("fa-check-circle")) {
        const taskId = parseInt(taskItem.dataset.taskId);
        const task = list.tasks.find(t => t.id === taskId);
        
        if (task) {
          task.completed = !task.completed;
          saveCurrentUser(currentUser);
          
          const icon = taskItem.querySelector("i");
          icon.classList.toggle("fa-circle");
          icon.classList.toggle("fa-check-circle");
          icon.classList.toggle("checked");
        }
      } else {
        const taskId = parseInt(taskItem.dataset.taskId);
        const task = list.tasks.find(t => t.id === taskId);
        
        if (task) {
          const cardDetail = document.getElementById("cardDetail");
          cardDetail.dataset.taskId = taskId;
          cardDetail.querySelector(".card-title").textContent = task.title;
          cardDetail.style.display = "flex";
        }
      }
    });
  });
}

function setupFilterModal() {
  const openFilterBtn = document.getElementById("openFilterModal");
  const filterModal = document.getElementById("filterModal");
  const closeFilterBtn = document.getElementById("closeFilterModal");

  if (openFilterBtn && filterModal && closeFilterBtn) {
    openFilterBtn.addEventListener("click", () => filterModal.classList.add("show"));
    closeFilterBtn.addEventListener("click", () => filterModal.classList.remove("show"));
  }
}

function setupMoveCardModal() {
  const openMoveCardBtn = document.getElementById("openMoveCard")
  const moveCardModal = document.getElementById("moveCardModal");
  const closeMoveCardBtn = document.getElementById("closeMoveCard")

  if(openMoveCardBtn && moveCardModal &&closeMoveCardBtn){
    openMoveCardBtn.addEventListener("click" , () => moveCardModal.classList.add("show"));
    closeMoveCardBtn.addEventListener("click" , () => moveCardModal.classList.remove("show"));
  }
}

function setupCreateLabelModal() {
  const openCreateLabelBtn = document.getElementById("openCreateLabelModal");
  const createLabelModal = document.getElementById("createLabelModal");
  const closeCreateLabelModal = document.getElementById("closeCreateLabelModal")

  if(openCreateLabelBtn && createLabelModal && closeCreateLabelModal){
    openCreateLabelBtn.addEventListener("click", () => createLabelModal.classList.add("show"));
    closeCreateLabelModal.addEventListener("click" , () => createLabelModal.classList.remove("show"));
  }
}

function setupCardDetailFunctionality(board, currentUser) {
  const cardDetail = document.getElementById("cardDetail");
  
  if (!cardDetail) return;
  
  cardDetail.querySelector(".action-buttons .btn.fill:nth-child(2)").addEventListener("click", (e) => {
    e.preventDefault();
    cardDetail.style.display = "none";
  });
  
  cardDetail.querySelector(".sidebar-actions .btn.fill:nth-child(3)").addEventListener("click", (e) => {
    e.preventDefault();
    const taskId = parseInt(cardDetail.dataset.taskId);
    
    if (!taskId) return;
    
    Swal.fire({
      title: "Delete Task?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete"
    }).then((result) => {
      if (result.isConfirmed) {
        for (const list of board.lists) {
          const taskIndex = list.tasks.findIndex(t => t.id === taskId);
          
          if (taskIndex !== -1) {
            list.tasks.splice(taskIndex, 1);
            saveCurrentUser(currentUser);
            
            renderBoardContent(board, currentUser);
            setupEventListeners(board, currentUser);
            
            cardDetail.style.display = "none";
            
            Swal.fire("Deleted!", "The task has been deleted.", "success");
            return;
          }
        }
        
        Swal.fire("Error!", "Task not found.", "error");
      }
    });
  });
}

function setupCloseBoardFunctionality(currentUser) {
  const closeBoardBtn = document.querySelector('.dashboard-actions .dashboard-btn:nth-child(4)');
  
  if (!closeBoardBtn) return;
  
  closeBoardBtn.addEventListener("click", () => {
    const boardId = getBoardIdFromURL();
    
    Swal.fire({
      title: "Close Board?",
      text: "This will permanently delete this board and all its contents.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, close it!"
    }).then((result) => {
      if (result.isConfirmed) {
        const boardIndex = currentUser.boards.findIndex(b => b.id === boardId);
        
        if (boardIndex !== -1) {
          currentUser.boards.splice(boardIndex, 1);
          saveCurrentUser(currentUser);
          
          Swal.fire(
            "Closed!",
            "The board has been removed.",
            "success"
          ).then(() => {
            window.location.href = "dashboard.html";
          });
        } else {
          Swal.fire(
            "Error!",
            "Board not found.",
            "error"
          );
        }
      }
    });
  });
}