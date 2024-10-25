import React from 'react';

const TaskSelector = ({ onTaskSelect }) => {
    const tasks = [
        { id: 'generate', title: 'Generate image', prompt: 'Generate an image of model dressed in a costume, playfully attempting to trick or treat in a suburban neighborhood.', image: '/generate.png' },
        { id: 'edit', title: 'Edit image', prompt: 'Edit this image: ', image: '/livingroom.png' },
        { id: 'stageHome', title: 'Add furniture', prompt: 'Stage this home interior', image: '/bedroom.png' },
        { id: 'remove-bg', title: 'Remove background', prompt: 'Remove the background from this image', image: '/removebg.png' },
        //{ id: 'upscale', title: 'Upscale image', prompt: 'Upscale this image: ', image: '/path_to_upscale_image.jpg' },
        //{ id: 'style-transfer', title: 'Style transfer', prompt: 'Apply style transfer to this image: ', image: '/path_to_style_transfer_image.jpg' },
        //{ id: 'colorize', title: 'Colorize image', prompt: 'Colorize this black and white image: ', image: '/path_to_colorize_image.jpg' },
    ];

    return (
        <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer backdrop-blur-md bg-white/30"
                        onClick={() => onTaskSelect(task.id)}
                    >
                        <div className="p-4 flex flex-col items-center">
                            <div className="w-[150px] h-[150px] mb-4 rounded-lg overflow-hidden flex items-center justify-center">
                                <img src={task.image} alt={task.title} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-lg font-semibold text-center">{task.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskSelector;
