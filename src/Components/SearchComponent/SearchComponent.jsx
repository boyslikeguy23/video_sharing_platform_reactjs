import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "../../Config/Debounce";
import { searchUserAction } from "../../Redux/User/Action";
import "./SearchComponent.css";
import SearchUserCard from "./SearchUserCard";

const SearchComponent = ({setIsSearchVisible}) => {
  const token = localStorage.getItem("token");
  const {user}=useSelector(store=>store);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearchUser = (query) => {
    const data = {
      jwt: token,
      query,
    };
    dispatch(searchUserAction(data));
  };
  const debouncedHandleSearchUser = debounce(handleSearchUser, 1000);

  const filteredResults = Array.isArray(user?.searchResult)
    ? user.searchResult.filter(item =>
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="search-container1">
      <div className="px-3 pb-5">
        <h1 className="text-xl pb-5">Tìm kiếm</h1>

        <input
          onChange={(e) => {
            setSearchQuery(e.target.value);
            debouncedHandleSearchUser(e.target.value);
          }}
          className="search-input"
          type="text"
          placeholder="Tìm kiếm..."
        />
      </div>

      <hr />
      <div className="search-results px-3 pt-5">
        {searchQuery.trim() !== "" &&
          (!user?.searchResult?.isError ?
            (filteredResults && filteredResults.length > 0
              ? filteredResults.map((item) => (
                  <SearchUserCard setIsSearchVisible={setIsSearchVisible} key={item.id} username={item.username} name={item.name} image={item?.image}/>
                ))
              : <h1 className="pt-10 font-bold text-center">Người dùng không tồn tại</h1>
            )
            : <h1 className="pt-10 font-bold text-center">Người dùng không tồn tại</h1>
          )
        }
      </div>
    </div>
  );
};

export default SearchComponent;
