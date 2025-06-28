// PageDropdown.jsx
import React, { useEffect, useState } from "react";
import { Select, Spin, message } from "antd";
import axios from "axios";

const { Option } = Select;

const PageDropdown = ({ accessToken }) => {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    if (accessToken) {
      fetchPages();
    }
  }, [accessToken]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ifsgcsc2-d02.demo.ifs.cloud/main/ifsapplications/projection/v1/FrameworkServices.svc/GetApplicationName()",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.pages) {
        setPages(response.data.pages);
      } else {
        message.error("No pages found.");
      }
    } catch (error) {
      message.error("Failed to fetch pages.");
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (value) => {
    message.success(`Selected Page ID: ${value}`);
  };

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Select
          style={{ width: "100%" }}
          placeholder="Select a page"
          onChange={handleSelect}
          options={pages.map((page) => ({
            label: page.pageTitle,
            value: page.pageId,
          }))}
        />
      )}
    </div>
  );
};

export default PageDropdown;
