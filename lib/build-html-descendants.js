export const buildDescendants = (
  document,
  descendants = "",
  itemComments = ""
) => {
  const descendantsCountText = document.createElement("span");
  descendantsCountText.setAttribute("class", "descendants");
  descendantsCountText.textContent = `: ${descendants}`;

  const descendantsLink = document.createElement("a");
  descendantsLink.setAttribute("href", itemComments);
  descendantsLink.textContent = "Comments";

  const descendantsSpan = document.createElement("span");
  descendantsSpan.setAttribute("class", "descendants-container");
  descendantsSpan.appendChild(descendantsLink);
  descendantsSpan.appendChild(descendantsCountText);

  return descendantsSpan;
};
