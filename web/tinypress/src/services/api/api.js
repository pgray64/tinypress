import axios from "axios";
import Cookies from "js-cookie";

export default axios.create({
  headers: {
    "X-XSRF-TOKEN": Cookies.get("_csrf"),
  },
});
