// simulate getting products from DataBase
const products = [
    { name: "apple", country: "italy", cost: 5, instock: 10 },
    { name: "oranges", country: "spain", cost: 3, instock: 3 },
    { name: "beans", country: "usa", cost: 2, instock: 5 },
    { name: "cabbage", country: "usa", cost: 6, instock: 8 },
  ];

const restockAPICall = (initialUrl, initialData) => {
    const [url, setUrl] = React.useState(initialUrl);
  
    const [state, dispatch] = React.useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });

    React.useEffect(() => {
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          console.log("FETCH FROM URl");
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);

    return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        console.log('fetch_init');
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "FETCH_SUCCESS":
        console.log('fetch_success');
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload.data,
        };
      case "FETCH_FAILURE":
        console.log('fetch_fail');
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
};

const Products = () => {
    const [items, setItems] = React.useState(products);
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const {
        Card,
        Accordion,
        Button,
        Container,
        Row,
        Col,
        Image,
        Input,
      } = ReactBootstrap;

    const [query, setQuery] = React.useState("http://localhost:1337/api/products");
    const [{ data, isLoading, isError }, doFetch] = restockAPICall(
        "http://localhost:1337/api/products",
        {
          data: [],
        }
      );

    const addToCart = (e) => {
        let name = e.target.name;
        let item = items.filter((item) => item.name == name);
        setCart([...cart, ...item]);
    };

    const removeFromCart = (index) => {
        let newCart = cart.filter((item, i) => index != i);
        setCart(newCart);
    };

    let list = items.map((item, index) => {
        return (
            <li key={index}>
              {/* <Image src={photos[index % 4]} width={70} roundedCircle></Image> */}
              {/* <Button variant="primary" size="large">
                {item.name}:{item.cost}
              </Button> */}
              <div>{item.name}: ${item.cost} Stock: {item.instock}</div>
              <input name={item.name} type="submit" onClick={addToCart} value="Add To Cart"></input>
            </li>
          );
    });
    let cartContents = cart.map((item, index) => {
        return (
            <Accordion.Item key={1+index} eventKey={1 + index}>
            <Accordion.Header>
                {item.name}
            </Accordion.Header>
            <Accordion.Body onClick={() => removeFromCart(index)} eventKey={1 + index}>
                $ {item.cost} from {item.country}
            </Accordion.Body>
            </Accordion.Item>
            );
    });

    let finalList = () => {
        let total = checkOut();
        let final = cart.map((item, index) => {
          return (
            <div key={index} index={index}>
              {item.name}
            </div>
          );
        });
        return { final, total };
      };

    const checkOut = () => {
        let costs = cart.map((item) => item.cost);
        const reducer = (accum, current) => accum + current;
        let newTotal = costs.reduce(reducer, 0);
        console.log(`total updated to ${newTotal}`);
        return newTotal;
      };

    const restockProducts = (url) => {
        
        doFetch(url);
        console.log('here');
        let newItems = data.map((item) => {
            let { name, country, cost, instock } = item.attributes;
            return { name, country, cost, instock };
        });
        setItems([...items, ...newItems]);
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Product List</h1>
                    <ul style={{ listStyleType: "none" }}>{list}</ul>
                </Col>
                <Col>
                    <h1>Cart Contents</h1>
                    <Accordion defaultActiveKey="0">{cartContents}</Accordion>
                </Col>
                <Col>
                    <h1>CheckOut </h1>
                    <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
                    <div> {finalList().total > 0 && finalList().final} </div>
                </Col>
            </Row>
            <Row>
                <form onSubmit={(event) => {
                    restockProducts(query);
                    event.preventDefault();
                }}>
                    <input type="text" value={query} onChange={(event) => setQuery(event.target.value)}></input>
                    <button type="submit">Restock</button>
                </form>
            </Row>
        </Container>
    );
}

ReactDOM.render(<Products />, document.getElementById('root'));