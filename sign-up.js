document.getElementById("signup-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !username || !password) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please fill all the fields",
    });
    return;
  }

  if (password.length < 8) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Password must be at least 8 characters long",
    });
    return;
  }

  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
  const usersData = JSON.parse(localStorage.getItem("usersData")) || { users: [] };

  const emailExists = existingUsers.some((user) => user.email === email);

  if (emailExists) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "This email is already registered",
    });
    return;
  }

  const newUser = { email, username, password };
  existingUsers.push(newUser);
  localStorage.setItem("users", JSON.stringify(existingUsers));

  const newUserId = usersData.users.length > 0 ? Math.max(...usersData.users.map(u => u.id)) + 1 : 1;

  const fullUserData = {
    id: newUserId,
    username,
    email,
    password,
    boards: [],
  };

  usersData.users.push(fullUserData);
  localStorage.setItem("usersData", JSON.stringify(usersData));

  let timerInterval;
  Swal.fire({
    title: "Auto close alert!",
    html: `Sign up successfully <br> Redirecting to sign in page in <b>2</b> second`,
    timer: 2000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const timer = Swal.getPopup().querySelector("b");
      timerInterval = setInterval(() => {
        timer.textContent = `${Math.ceil(Swal.getTimerLeft() / 1000)}`;
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
      window.location.href = "sign-in.html";
    }
  });
});
