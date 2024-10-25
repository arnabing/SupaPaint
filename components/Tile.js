const Tile = ({ image, title, onClick }) => {
    return (
        <div
            className="bg-white rounded-lg overflow-hidden shadow-md transition-transform transform hover:scale-105 p-4 cursor-pointer"
            onClick={onClick}
        >
            <img src={image} alt={title} className="w-full h-auto rounded-md" />
            <h3 className="mt-4 text-lg text-center">{title}</h3>
        </div>
    );
};

export default Tile;
