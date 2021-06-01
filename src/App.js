import { Fragment, useState, useEffect } from "react"; // Not sure why, but when i imported from index.js it threw an error
import "./App.css";

import jwt from "jsonwebtoken";

// this token gets you access to almost all of Emsi's jpa data
const getToken = () =>
	jwt.sign(
		{
			exp: (() => Math.floor(Date.now() / 1000) + 60)(),
			iss: "learn-web-dev-camper-key",
		},
		"web-dev-camper-secret"
	);

function App() {
	const [jobsAdded, setJobsAdded] = useState(0);
	const [isIncreasing, setIsIncreasing] = useState(false);

	return (
		<div className="App">
			<Header />
			<div className="content">
				<Main
					setJobsAdded={setJobsAdded}
					setIsIncreasing={setIsIncreasing}
				/>
				<SideBar jobsAdded={jobsAdded} isIncreasing={isIncreasing} />
			</div>
		</div>
	);
}

export default App;

function Header() {
	return (
		<div className="App-header">
			<h2>Job Postings for the Galaxy</h2>
		</div>
	);
}

function Main(props) {
	const { jobsAdded, setJobsAdded, setIsIncreasing } = props;

	const [titles, setTitles] = useState([]);
	const [skills, setSkills] = useState({});
	const [lookingToHire, setLookingToHire] = useState({});

	const [query, setQuery] = useState("python"); // so that user can type in search input
	const [search, setSearch] = useState("python");

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		fetchData("title", search, setTitles, setSkills);
		setIsLoading(false);
	}, [search]);

	return (
		<div className="main">
			Main
			<input
				type="text"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			/>
			<button onClick={() => setSearch(query)}>Search</button>
			<div className="lists">
				{isLoading ? (
					<div>Loading ...</div>
				) : (
					<ul>
						<li>
							<h3>Job listings</h3>
						</li>
						{titles.data &&
							titles.data.map((item) => (
								<li key={item.id}>
									<span>
										<div value={item.name}>{item.name}</div>
										<button
											onClick={() => {
												// add title to lookingToHire list
												console.log(item.id);
												const copy = {
													...lookingToHire,
												};
												copy[item.id] = item;
												setLookingToHire(copy);

												// add random skill
												fetchData(
													"skills",
													search,
													setTitles,
													setSkills,
													skills
												);

												// increment count
												setJobsAdded(
													(count) => count + 1
												);
												setIsIncreasing(true);
											}}
										>
											Add
										</button>
									</span>
								</li>
							))}
					</ul>
				)}
				<ul>
					<li>
						<h3>Looking to hire</h3>
					</li>
					{lookingToHire &&
						Object.keys(lookingToHire).map((item) => (
							<li key={item}>
								<span>
									<div value={lookingToHire[item].name}>
										{lookingToHire[item].name}
									</div>
									<button
										onClick={() => {
											removeListItem(
												lookingToHire,
												setLookingToHire,
												item
											);
											setJobsAdded((count) => count - 1);
											setIsIncreasing(false);
										}}
									>
										Remove
									</button>
								</span>
							</li>
						))}
				</ul>
				<ul>
					<li>
						<h3>Skills</h3>
					</li>
					{skills &&
						Object.keys(skills).map((item) => (
							<li key={item}>
								<span>
									<div value={skills[item].name}>
										{skills[item].name}
									</div>
									<button
										onClick={() => {
											// remove item from skills list
											removeListItem(
												skills,
												setSkills,
												item
											);
										}}
									>
										Remove
									</button>
								</span>
							</li>
						))}
				</ul>
			</div>
		</div>
	);
}

function SideBar(props) {
	const { jobsAdded, isIncreasing } = props;
	console.log("did color change?");
	console.log("isIncreasing: " + isIncreasing);
	useEffect(() => {
		console.log("color changed");
	}, [isIncreasing]);
	return (
		<div
			className="App-side-bar"
			style={isIncreasing ? { color: "green" } : { color: "red" }}
		>
			In demand job count:
			<div className="jobs-added">{jobsAdded}</div>
		</div>
	);
}

const fetchData = async (type, search, setTitles, setSkills, skills) => {
	fetch(
		`https://emsiservices.com/emsi-open-proxy-service/postings/us/taxonomies/${type}?q=${search}&limit=50`,
		{
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${getToken()}`,
			},
		}
	)
		.then((res) => res.json())
		.then((res) => {
			if (type == "title") {
				setTitles(res);
			} else {
				// skills
				let index = Math.floor(Math.random() * res.data.length);
				let newSkill = res.data[index];
				let id = Date.now(); // always a unique id
				const copy = { ...skills };
				copy[id] = { ...newSkill };
				setSkills(copy);
				console.log(skills);
			}
		});
};

const removeListItem = (listData, setListData, item) => {
	// remove from skill list
	const copy = { ...listData };
	const keys = Object.keys(copy);
	delete copy[item];
	setListData(copy);
};
